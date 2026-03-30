import { wrap } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/postgresql'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import Decimal from 'decimal.js'
import { AppliedDiscount } from '../discounts/entities/applied-discount.entity'
import { DiscountType } from '../discounts/entities/discount-type.enum'
import { Discount } from '../discounts/entities/discount.entity'
import { Family } from '../families/entities/family.entity'
import { FamiliesRepository } from '../families/families.repository'
import { FeeConcept } from '../fee-concepts/entities/fee-concept.entity'
import { FeeConceptType } from '../fee-concepts/entities/fee-concept-type.enum'
import { FeePrice } from '../fee-prices/entities/fee-price.entity'
import { PriceTier } from '../price-tiers/entities/price-tier.entity'
import { StudentService } from '../student-services/entities/student-service.entity'
import { Enrollment } from '../students/entities/enrollment.entity'
import { EnrollmentStatus } from '../students/entities/enrollment-status.enum'
import { Level } from '../students/entities/level.enum'
import { Student } from '../students/entities/student.entity'
import { SystemConfigService } from '../system-config/system-config.service'
import { InstallmentDetail } from './entities/installment-detail.entity'
import { InstallmentStatus } from './entities/installment-status.enum'
import { Installment } from './entities/installment.entity'
import { InstallmentsRepository } from './installments.repository'
import { GenerateInstallment } from './schemas/generate-installment.schema'

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** Mapea level + grade al code del PriceTier */
function resolvePriceTierCode(level: Level, grade: number): string {
  if (level === Level.Jardin) return 'jardin'
  if (level === Level.Secundaria) return 'secundaria'
  return grade <= 3 ? 'primaria_1' : 'primaria_2'
}

/**
 * Aplica porcentajes de descuento acumulados sobre un monto base.
 * Los porcentajes se suman (no se encadenan) con tope en 100%.
 */
function applyDiscountPercentages(amount: Decimal, percentages: Decimal[]): Decimal {
  const sum = percentages.reduce((acc, p) => acc.plus(p), new Decimal(0))
  const totalPct = Decimal.min(sum, new Decimal(100))
  return amount.mul(totalPct).div(100).toDecimalPlaces(2)
}

@Injectable()
export class InstallmentsService {
  constructor(
    private readonly installmentsRepository: InstallmentsRepository,
    private readonly familiesRepository: FamiliesRepository,
    private readonly systemConfigService: SystemConfigService,
    private readonly em: EntityManager,
  ) {}

  async listByFamily(familyId: string) {
    const family = await this.familiesRepository.findOneById(familyId)
    if (!family) throw new NotFoundException('Familia no encontrada')
    return this.installmentsRepository.findByFamily(familyId)
  }

  async getInstallment(installmentId: string) {
    const installment = await this.installmentsRepository.findOneById(installmentId)
    if (!installment) throw new NotFoundException('Cuota no encontrada')
    return installment
  }

  async generateInstallment(data: GenerateInstallment) {
    const academicYear = data.academicYear ?? (await this.systemConfigService.getCurrentAcademicYear())
    const em = this.em.fork()

    const family = await em.findOne(Family, { id: data.familyId })
    if (!family) throw new NotFoundException('Familia no encontrada')

    // Si existe cuota para este periodo, la regeneramos (salvo si está pagada)
    const existing = await this.installmentsRepository.findOneByFamilyMonthYear(
      data.familyId,
      data.month,
      academicYear,
    )
    if (existing) {
      if (existing.status === InstallmentStatus.Pagada) {
        throw new BadRequestException('No se puede regenerar una cuota ya pagada')
      }
      await em.nativeDelete(InstallmentDetail, { installment: { id: existing.id } })
      await em.nativeDelete(Installment, { id: existing.id })
    }

    // Obtener enrollments confirmados de la familia para el año
    const enrollments = await em.findAll(Enrollment, {
      where: {
        student: { family: { id: data.familyId } },
        academicYear,
        status: EnrollmentStatus.Confirmado,
      },
      populate: ['student', 'student.family'],
      orderBy: { createdAt: 'ASC' }, // orden para determinar quién es el 2do hermano
    })

    if (enrollments.length === 0) {
      throw new BadRequestException(
        'La familia no tiene alumnos con inscripción confirmada para este año lectivo',
      )
    }

    // Cargar descuento por hermano activo (si existe)
    const hermanoDiscount = await em.findOne(Discount, {
      type: DiscountType.Hermano,
      isActive: true,
    })

    const allPriceTiers = await em.findAll(PriceTier, {})
    const tierByCode = new Map(allPriceTiers.map((t) => [t.code, t]))

    const details: Array<{
      student: Student
      feeConcept: FeeConcept
      description: string
      amount: Decimal
      discountAmount: Decimal
      finalAmount: Decimal
    }> = []

    let totalSubtotal = new Decimal(0)
    let totalDiscount = new Decimal(0)

    // Los alumnos desde el índice 1 en adelante son "2do hermano y siguientes"
    const isSecondOrLaterSibling = (index: number) => index >= 1

    for (let i = 0; i < enrollments.length; i++) {
      const enrollment = enrollments[i]
      const student = enrollment.student.getEntity()
      const tierCode = resolvePriceTierCode(enrollment.level, enrollment.grade)
      const tier = tierByCode.get(tierCode)
      if (!tier) continue

      // Descuentos manuales activos para este alumno y año (beca + docente_hijo)
      const appliedDiscounts = await em.findAll(AppliedDiscount, {
        where: {
          student: { id: student.id },
          academicYear,
          discount: { isActive: true },
        },
        populate: ['discount'],
      })

      const manualPcts = appliedDiscounts
        .filter((ad) => {
          const type = ad.discount.getEntity().type
          return type === DiscountType.Beca || type === DiscountType.DocenteHijo
        })
        .map((ad) => new Decimal(ad.percentage))

      // --- Aranceles ---
      const arancelPrices = await em.findAll(FeePrice, {
        where: {
          priceTier: { id: tier.id },
          academicYear,
          feeConcept: { type: FeeConceptType.Arancel, isActive: true },
        },
        populate: ['feeConcept'],
      })

      for (const fp of arancelPrices) {
        const concept = fp.feeConcept.getEntity()
        const amount = new Decimal(fp.amount)

        // Acumular porcentajes: hermano (si aplica) + manuales
        const pcts: Decimal[] = [...manualPcts]
        if (isSecondOrLaterSibling(i) && hermanoDiscount) {
          pcts.push(new Decimal(hermanoDiscount.percentage))
        }

        const discountAmount = applyDiscountPercentages(amount, pcts)
        const finalAmount = amount.minus(discountAmount)

        totalSubtotal = totalSubtotal.plus(amount)
        totalDiscount = totalDiscount.plus(discountAmount)

        const pctLabel = pcts.length > 0
          ? ` (-${Decimal.min(pcts.reduce((a, b) => a.plus(b), new Decimal(0)), new Decimal(100)).toFixed(0)}%)`
          : ''
        details.push({
          student,
          feeConcept: concept,
          description: `${concept.name} — ${tier.name} (${student.firstName} ${student.lastName})${pctLabel}`,
          amount,
          discountAmount,
          finalAmount,
        })
      }

      // --- Servicios adicionales (sin descuentos por hermano ni becas) ---
      const services = await em.findAll(StudentService, {
        where: { student: { id: student.id }, academicYear },
        populate: ['feeConcept'],
      })

      for (const svc of services) {
        const concept = svc.feeConcept.getEntity()
        if (!concept.isActive) continue

        const dueDate = new Date(data.dueDate)
        const monthStart = new Date(academicYear, data.month - 1, 1)
        const monthEnd = new Date(academicYear, data.month, 0)
        const activeFrom = new Date(svc.activeFrom)
        const activeTo = svc.activeTo ? new Date(svc.activeTo) : null

        if (activeFrom > monthEnd) continue
        if (activeTo && activeTo < monthStart) continue
        void dueDate // usado solo para referencia de contexto

        const servicePrices = await em.findAll(FeePrice, {
          where: { feeConcept: { id: concept.id }, academicYear },
        })
        const fp = servicePrices[0]
        if (!fp) continue

        const amount = new Decimal(fp.amount)
        totalSubtotal = totalSubtotal.plus(amount)

        details.push({
          student,
          feeConcept: concept,
          description: `${concept.name} (${student.firstName} ${student.lastName})`,
          amount,
          discountAmount: new Decimal(0),
          finalAmount: amount,
        })
      }
    }

    if (details.length === 0) {
      throw new BadRequestException(
        'No se encontraron conceptos con precio configurado para generar la cuota',
      )
    }

    const total = totalSubtotal.minus(totalDiscount)
    const monthName = MONTH_NAMES[data.month]

    const installment = new Installment({
      family: wrap(family).toReference(),
      academicYear,
      month: data.month,
      description: `Cuota ${monthName} ${academicYear}`,
      subtotal: totalSubtotal.toFixed(2),
      discountAmount: totalDiscount.toFixed(2),
      total: total.toFixed(2),
      dueDate: new Date(data.dueDate),
      notes: data.notes ?? null,
    })

    em.persist(installment)

    for (const d of details) {
      const detail = new InstallmentDetail({
        installment: wrap(installment).toReference(),
        student: d.student ? wrap(d.student).toReference() : null,
        feeConcept: wrap(d.feeConcept).toReference(),
        description: d.description,
        amount: d.amount.toFixed(2),
        discountAmount: d.discountAmount.toFixed(2),
        finalAmount: d.finalAmount.toFixed(2),
      })
      em.persist(detail)
    }

    await em.flush()

    return this.installmentsRepository.findOneById(installment.id)
  }

  async annulInstallment(installmentId: string) {
    const installment = await this.installmentsRepository.findOneById(installmentId)
    if (!installment) throw new NotFoundException('Cuota no encontrada')
    if (installment.status === InstallmentStatus.Pagada) {
      throw new BadRequestException('No se puede anular una cuota pagada')
    }
    installment.annul()
    await this.em.flush()
    return installment
  }
}
