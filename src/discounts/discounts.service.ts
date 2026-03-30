import { wrap } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/postgresql'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { Session } from '../auth/entities/session.entity'
import { Student } from '../students/entities/student.entity'
import { User } from '../users/entities/user.entity'
import { AppliedDiscount } from './entities/applied-discount.entity'
import { DiscountType } from './entities/discount-type.enum'
import { Discount } from './entities/discount.entity'
import { DiscountsRepository } from './discounts.repository'
import { CreateAppliedDiscount } from './schemas/create-applied-discount.schema'
import { UpdateDiscount } from './schemas/update-discount.schema'

const DEFAULT_DISCOUNTS: Array<{ type: DiscountType; name: string; percentage: string }> = [
  { type: DiscountType.Hermano, name: 'Descuento por hermano', percentage: '10.00' },
  { type: DiscountType.Beca, name: 'Beca', percentage: '50.00' },
  { type: DiscountType.DocenteHijo, name: 'Hijo de docente', percentage: '100.00' },
  { type: DiscountType.ProntoPago, name: 'Pronto pago', percentage: '5.00' },
]

@Injectable()
export class DiscountsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(this.constructor.name)

  constructor(
    private readonly discountsRepository: DiscountsRepository,
    private readonly em: EntityManager,
  ) {}

  async onApplicationBootstrap() {
    const em = this.em.fork()
    for (const defaults of DEFAULT_DISCOUNTS) {
      const existing = await em.findOne(Discount, { type: defaults.type })
      if (!existing) {
        this.logger.log(`Seeding discount: ${defaults.name}`)
        em.persist(new Discount(defaults))
      }
    }
    await em.flush()
  }

  async listDiscounts() {
    return this.discountsRepository.findAll()
  }

  async updateDiscount(id: string, data: UpdateDiscount) {
    const discount = await this.discountsRepository.findOneById(id)
    if (!discount) throw new NotFoundException('Descuento no encontrado')

    if (data.name !== undefined) discount.name = data.name
    if (data.percentage !== undefined) discount.percentage = data.percentage

    await this.em.flush()
    return discount
  }

  async toggleDiscount(id: string) {
    const discount = await this.discountsRepository.findOneById(id)
    if (!discount) throw new NotFoundException('Descuento no encontrado')
    discount.isActive ? discount.deactivate() : discount.activate()
    await this.em.flush()
    return discount
  }

  async listAppliedByStudent(studentId: string, academicYear: number) {
    return this.discountsRepository.findAppliedByStudent(studentId, academicYear)
  }

  async applyDiscount(data: CreateAppliedDiscount, session: Session) {
    const em = this.em.fork()

    const discount = await em.findOne(Discount, { id: data.discountId })
    if (!discount) throw new NotFoundException('Descuento no encontrado')
    if (!discount.isActive) throw new BadRequestException('El descuento no está activo')
    if (discount.type === DiscountType.Hermano || discount.type === DiscountType.ProntoPago) {
      throw new BadRequestException(
        `El descuento "${discount.name}" es automático y no puede aplicarse manualmente`,
      )
    }

    const student = await em.findOne(Student, { id: data.studentId })
    if (!student) throw new NotFoundException('Alumno no encontrado')

    // Verificar que no exista ya el mismo tipo de descuento para este alumno y año
    const existing = await em.findOne(AppliedDiscount, {
      student: { id: data.studentId },
      discount: { type: discount.type },
      academicYear: data.academicYear,
    })
    if (existing) {
      throw new ConflictException(
        `El alumno ya tiene el descuento "${discount.name}" aplicado para ${data.academicYear}`,
      )
    }

    const user = await em.findOne(User, { id: session.user.id })

    const applied = new AppliedDiscount({
      discount: wrap(discount).toReference(),
      student: wrap(student).toReference(),
      academicYear: data.academicYear,
      percentage: data.percentage ?? discount.percentage,
      approvedBy: user ? wrap(user).toReference() : null,
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validTo: data.validTo ? new Date(data.validTo) : null,
      notes: data.notes ?? null,
    })

    em.persist(applied)
    await em.flush()

    return this.discountsRepository.findAppliedById(applied.id)
  }

  async removeAppliedDiscount(appliedDiscountId: string) {
    const applied = await this.discountsRepository.findAppliedById(appliedDiscountId)
    if (!applied) throw new NotFoundException('Descuento aplicado no encontrado')
    await this.em.removeAndFlush(applied)
  }
}
