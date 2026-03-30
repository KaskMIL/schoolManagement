import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Ref,
} from '@mikro-orm/core'
import * as uuid from 'uuid'
import { Student } from '../../students/entities/student.entity'
import { User } from '../../users/entities/user.entity'
import { Discount } from './discount.entity'

/**
 * Descuento aplicado a un alumno específico para un año lectivo.
 * Solo para descuentos manuales (beca, docente_hijo).
 * Los automáticos (hermano, pronto_pago) no usan esta tabla.
 */
@Entity({ tableName: 'applied_discounts' })
export class AppliedDiscount {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7()

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date()

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date()

  @ManyToOne(() => Discount, { ref: true })
  discount: Ref<Discount>

  @ManyToOne(() => Student, { ref: true })
  student: Ref<Student>

  @Property({ type: 'integer' })
  academicYear: number

  /** Porcentaje efectivo aplicado (puede diferir del default del Discount si fue customizado) */
  @Property({ columnType: 'numeric(5,2)' })
  percentage: string

  @ManyToOne(() => User, { ref: true, nullable: true })
  approvedBy: Ref<User> | null = null

  @Property({ type: 'date', nullable: true })
  validFrom: Date | null = null

  @Property({ type: 'date', nullable: true })
  validTo: Date | null = null

  @Property({ type: 'text', nullable: true })
  notes: string | null = null

  constructor(props: AppliedDiscountProps) {
    this.discount = props.discount
    this.student = props.student
    this.academicYear = props.academicYear
    this.percentage = props.percentage
    this.approvedBy = props.approvedBy ?? null
    this.validFrom = props.validFrom ?? null
    this.validTo = props.validTo ?? null
    this.notes = props.notes ?? null
  }
}

export type AppliedDiscountProps = Pick<
  AppliedDiscount,
  'discount' | 'student' | 'academicYear' | 'percentage'
> &
  Partial<Pick<AppliedDiscount, 'approvedBy' | 'validFrom' | 'validTo' | 'notes'>>
