import { wrap } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/postgresql'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import Decimal from 'decimal.js'
import { Session } from '../auth/entities/session.entity'
import { Family } from '../families/entities/family.entity'
import { FamiliesRepository } from '../families/families.repository'
import { Installment } from '../installments/entities/installment.entity'
import { InstallmentStatus } from '../installments/entities/installment-status.enum'
import { SystemConfigService } from '../system-config/system-config.service'
import { User } from '../users/entities/user.entity'
import { Payment } from './entities/payment.entity'
import { Receipt } from './entities/receipt.entity'
import { PaymentsRepository } from './payments.repository'
import { CreatePayment } from './schemas/create-payment.schema'

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly familiesRepository: FamiliesRepository,
    private readonly systemConfigService: SystemConfigService,
    private readonly em: EntityManager,
  ) {}

  async listByFamily(familyId: string) {
    const family = await this.familiesRepository.findOneById(familyId)
    if (!family) throw new NotFoundException('Familia no encontrada')
    return this.paymentsRepository.findByFamily(familyId)
  }

  async getPayment(paymentId: string) {
    const payment = await this.paymentsRepository.findOneById(paymentId)
    if (!payment) throw new NotFoundException('Pago no encontrado')
    return payment
  }

  async createPayment(data: CreatePayment, session: Session) {
    const em = this.em.fork()

    const family = await em.findOne(Family, { id: data.familyId })
    if (!family) throw new NotFoundException('Familia no encontrada')

    const user = await em.findOne(User, { id: session.user.id })
    if (!user) throw new NotFoundException('Usuario no encontrado')

    let installmentRef = undefined
    let installment: Installment | null = null

    if (data.installmentId) {
      installment = await em.findOne(Installment, { id: data.installmentId })
      if (!installment) throw new NotFoundException('Cuota no encontrada')
      if (installment.status === InstallmentStatus.Anulada) {
        throw new BadRequestException('No se puede registrar un pago en una cuota anulada')
      }
      installmentRef = wrap(installment).toReference()
    }

    const payment = new Payment({
      family: wrap(family).toReference(),
      installment: installmentRef,
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      method: data.method,
      reference: data.reference ?? null,
      receivedBy: wrap(user).toReference(),
      notes: data.notes ?? null,
    })

    em.persist(payment)

    // Generar recibo
    const academicYear = await this.systemConfigService.getCurrentAcademicYear()
    const receiptNumber = await this.paymentsRepository.getNextReceiptNumber(academicYear)

    const receipt = new Receipt({
      payment: wrap(payment).toReference(),
      receiptNumber,
      academicYear,
      issuedDate: new Date(data.paymentDate),
    })

    em.persist(receipt)

    // Actualizar estado de la cuota si corresponde
    if (installment) {
      await this.updateInstallmentStatus(installment, data.amount, em)
    }

    await em.flush()

    return this.paymentsRepository.findOneById(payment.id)
  }

  private async updateInstallmentStatus(
    installment: Installment,
    paidAmount: string,
    em: EntityManager,
  ) {
    // Calcular total pagado para esta cuota (incluyendo el pago actual)
    const existingPayments = await em.findAll(Payment, {
      where: { installment: { id: installment.id } },
    })

    const totalPaid = existingPayments
      .reduce((acc, p) => acc.plus(new Decimal(p.amount)), new Decimal(0))
      .plus(new Decimal(paidAmount))

    const total = new Decimal(installment.total)

    if (totalPaid.gte(total)) {
      installment.updateStatus(InstallmentStatus.Pagada)
    } else {
      installment.updateStatus(InstallmentStatus.Parcial)
    }
  }
}
