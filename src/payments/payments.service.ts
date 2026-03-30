import { wrap } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/postgresql'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import Decimal from 'decimal.js'
import { Session } from '../auth/entities/session.entity'
import { DiscountType } from '../discounts/entities/discount-type.enum'
import { Discount } from '../discounts/entities/discount.entity'
import { Family } from '../families/entities/family.entity'
import { FamiliesRepository } from '../families/families.repository'
import { FeeConceptType } from '../fee-concepts/entities/fee-concept-type.enum'
import { InstallmentDetail } from '../installments/entities/installment-detail.entity'
import { Installment } from '../installments/entities/installment.entity'
import { InstallmentStatus } from '../installments/entities/installment-status.enum'
import { Institution } from '../institutions/entities/institution.entity'
import { SystemConfigService } from '../system-config/system-config.service'
import { User } from '../users/entities/user.entity'
import { PaymentAllocation } from './entities/payment-allocation.entity'
import { Payment } from './entities/payment.entity'
import { Receipt } from './entities/receipt.entity'
import { PaymentsRepository } from './payments.repository'
import { CreatePayment } from './schemas/create-payment.schema'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia bancaria',
  mercadopago: 'MercadoPago',
}

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

    // Validar suma de allocations == monto del pago
    if (data.allocations.length > 0) {
      const sumAllocations = data.allocations
        .reduce((acc, a) => acc.plus(new Decimal(a.allocatedAmount)), new Decimal(0))
      if (!sumAllocations.eq(new Decimal(data.amount))) {
        throw new BadRequestException(
          `La suma de las asignaciones (${sumAllocations.toFixed(2)}) debe ser igual al monto del pago (${data.amount})`,
        )
      }
    }

    // Cargar y validar cuotas
    const installmentMap = new Map<string, Installment>()
    for (const alloc of data.allocations) {
      const installment = await em.findOne(Installment, { id: alloc.installmentId })
      if (!installment) throw new NotFoundException(`Cuota ${alloc.installmentId} no encontrada`)
      if (installment.status === InstallmentStatus.Anulada) {
        throw new BadRequestException(`No se puede pagar la cuota "${installment.description}" porque está anulada`)
      }
      if (installment.status === InstallmentStatus.Pagada) {
        throw new BadRequestException(`La cuota "${installment.description}" ya está completamente pagada`)
      }
      installmentMap.set(alloc.installmentId, installment)
    }

    const payment = new Payment({
      family: wrap(family).toReference(),
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      method: data.method,
      reference: data.reference ?? null,
      receivedBy: wrap(user).toReference(),
      notes: data.notes ?? null,
    })

    em.persist(payment)

    // Crear allocations, actualizar status y verificar pronto pago
    for (const allocData of data.allocations) {
      const installment = installmentMap.get(allocData.installmentId)!

      const allocation = new PaymentAllocation({
        payment: wrap(payment).toReference(),
        installment: wrap(installment).toReference(),
        allocatedAmount: allocData.allocatedAmount,
      })
      em.persist(allocation)

      await this.refreshInstallmentStatus(installment, allocData.allocatedAmount, em)

      // Si la cuota quedó completamente pagada, evaluar pronto pago
      if (installment.status === InstallmentStatus.Pagada) {
        await this.applyEarlyPaymentDiscountIfApplicable(
          installment,
          new Date(data.paymentDate),
          em,
        )
      }
    }

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
    await em.flush()

    return this.paymentsRepository.findOneById(payment.id)
  }

  /**
   * Recalcula el status de la cuota sumando todas sus allocations existentes
   * más el nuevo monto que se acaba de registrar.
   */
  private async refreshInstallmentStatus(
    installment: Installment,
    newAllocatedAmount: string,
    em: EntityManager,
  ) {
    const existingAllocations = await em.findAll(PaymentAllocation, {
      where: { installment: { id: installment.id } },
    })

    const totalAllocated = existingAllocations
      .reduce((acc, a) => acc.plus(new Decimal(a.allocatedAmount)), new Decimal(0))
      .plus(new Decimal(newAllocatedAmount))

    const total = new Decimal(installment.total)

    if (totalAllocated.gte(total)) {
      installment.updateStatus(InstallmentStatus.Pagada)
    } else {
      installment.updateStatus(InstallmentStatus.Parcial)
    }
  }

  /**
   * Si la fecha de pago es ≤ día de corte del mes de la cuota, aplica el descuento
   * de pronto pago sobre los detalles de tipo arancel y recalcula el total de la cuota.
   */
  private async applyEarlyPaymentDiscountIfApplicable(
    installment: Installment,
    paymentDate: Date,
    em: EntityManager,
  ) {
    const cutoffDay = await this.systemConfigService.getEarlyPaymentCutoffDay()

    // El día de corte es el día N del mes de vencimiento de la cuota
    const dueDate = new Date(installment.dueDate)
    const cutoffDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), cutoffDay)

    if (paymentDate > cutoffDate) return  // no aplica pronto pago

    const prontoPagoDiscount = await em.findOne(Discount, {
      type: DiscountType.ProntoPago,
      isActive: true,
    })
    if (!prontoPagoDiscount) return

    const pct = new Decimal(prontoPagoDiscount.percentage).div(100)

    // Buscar detalles de tipo arancel de la cuota
    const details = await em.findAll(InstallmentDetail, {
      where: { installment: { id: installment.id } },
      populate: ['feeConcept'],
    })

    const arancelDetails = details.filter(
      (d) => d.feeConcept.getEntity().type === FeeConceptType.Arancel,
    )

    if (arancelDetails.length === 0) return

    let extraDiscount = new Decimal(0)

    for (const detail of arancelDetails) {
      // El pronto pago se calcula sobre el finalAmount ya descontado (no sobre el bruto)
      const additionalDiscount = new Decimal(detail.finalAmount).mul(pct).toDecimalPlaces(2)
      detail.discountAmount = new Decimal(detail.discountAmount).plus(additionalDiscount).toFixed(2)
      detail.finalAmount = new Decimal(detail.finalAmount).minus(additionalDiscount).toFixed(2)
      extraDiscount = extraDiscount.plus(additionalDiscount)
    }

    // Actualizar totales de la cuota
    installment.discountAmount = new Decimal(installment.discountAmount).plus(extraDiscount).toFixed(2)
    installment.total = new Decimal(installment.total).minus(extraDiscount).toFixed(2)
  }

  /**
   * Devuelve todos los datos necesarios para generar el PDF del recibo.
   * Query profunda: payment → receipt, family.guardians, allocations.installment.details.student.institution
   */
  async getReceiptData(paymentId: string) {
    const payment = await this.em.findOne(
      Payment,
      { id: paymentId },
      {
        populate: [
          'receipt',
          'family',
          'family.guardians',
          'receivedBy',
          'allocations',
          'allocations.installment',
          'allocations.installment.details',
          'allocations.installment.details.feeConcept',
          'allocations.installment.details.student',
          'allocations.installment.details.student.institution',
        ],
      },
    )

    if (!payment) throw new NotFoundException('Pago no encontrado')
    if (!payment.receipt) throw new NotFoundException('Este pago no tiene recibo asociado')

    const family = payment.family.getEntity()
    const receipt = payment.receipt
    const receivedBy = payment.receivedBy.getEntity()

    // Guardián principal de la familia
    const primaryContact = family.guardians
      .getItems()
      .find((g) => g.isPrimaryContact) ?? family.guardians.getItems()[0] ?? null

    // Recopilar instituciones únicas presentes en los detalles de la cuota
    const institutionMap = new Map<string, Institution>()
    for (const alloc of payment.allocations.getItems()) {
      for (const detail of alloc.installment.getEntity().details.getItems()) {
        if (detail.student) {
          const inst = detail.student.getEntity().institution.getEntity()
          if (!institutionMap.has(inst.id)) institutionMap.set(inst.id, inst)
        }
      }
    }

    // Armar allocations para el DTO
    const allocations = payment.allocations.getItems().map((alloc) => {
      const installment = alloc.installment.getEntity()
      const details = installment.details.getItems().map((d) => ({
        description: d.description,
        amount: d.amount,
        discountAmount: d.discountAmount,
        finalAmount: d.finalAmount,
      }))
      return {
        installmentDescription: installment.description,
        subtotal: installment.subtotal,
        discountAmount: installment.discountAmount,
        total: installment.total,
        details,
      }
    })

    return {
      receiptNumber: receipt.receiptNumber,
      academicYear: receipt.academicYear,
      issuedDate: receipt.issuedDate instanceof Date
        ? receipt.issuedDate.toISOString().slice(0, 10)
        : String(receipt.issuedDate),
      paymentDate: payment.paymentDate instanceof Date
        ? payment.paymentDate.toISOString().slice(0, 10)
        : String(payment.paymentDate),
      amount: payment.amount,
      method: PAYMENT_METHOD_LABELS[payment.method] ?? payment.method,
      reference: payment.reference,
      family: {
        name: family.familyName,
        address: family.address,
      },
      primaryContact: primaryContact
        ? { firstName: primaryContact.firstName, lastName: primaryContact.lastName }
        : null,
      institutions: Array.from(institutionMap.values()).map((inst) => ({
        name: inst.name,
        address: inst.address,
        phone: inst.phone,
        logoUrl: inst.logoUrl,
      })),
      allocations,
      receivedBy: receivedBy.username,
    }
  }
}
