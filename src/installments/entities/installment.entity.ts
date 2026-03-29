import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Ref,
} from '@mikro-orm/core'
import * as uuid from 'uuid'
import { Family } from '../../families/entities/family.entity'
import { InstallmentDetail } from './installment-detail.entity'
import { InstallmentStatus } from './installment-status.enum'

@Entity({ tableName: 'installments' })
export class Installment {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7()

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date()

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date()

  @ManyToOne(() => Family, { ref: true })
  family: Ref<Family>

  @Property({ type: 'integer' })
  academicYear: number

  /** 1-12 */
  @Property({ type: 'smallint' })
  month: number

  @Property({ type: 'text' })
  description: string

  /** Suma de conceptos sin descuentos ni recargos */
  @Property({ columnType: 'numeric(10,2)' })
  subtotal: string

  /** Monto de descuentos aplicados (positivo) */
  @Property({ columnType: 'numeric(10,2)' })
  discountAmount: string = '0.00'

  /** Monto de recargo por mora */
  @Property({ columnType: 'numeric(10,2)' })
  surchargeAmount: string = '0.00'

  /** subtotal - discountAmount + surchargeAmount */
  @Property({ columnType: 'numeric(10,2)' })
  total: string

  @Property({ type: 'date' })
  dueDate: Date

  @Enum({ items: () => InstallmentStatus, nativeEnumName: 'installment_status' })
  status: InstallmentStatus = InstallmentStatus.Pendiente

  @Property({ type: 'timestamptz' })
  generatedAt: Date = new Date()

  @Property({ type: 'text', nullable: true })
  notes: string | null = null

  @OneToMany(() => InstallmentDetail, (d) => d.installment, { cascade: [] })
  details = new Collection<InstallmentDetail>(this)

  constructor(props: InstallmentProps) {
    this.family = props.family
    this.academicYear = props.academicYear
    this.month = props.month
    this.description = props.description
    this.subtotal = props.subtotal
    this.discountAmount = props.discountAmount ?? '0.00'
    this.surchargeAmount = props.surchargeAmount ?? '0.00'
    this.total = props.total
    this.dueDate = props.dueDate
    this.status = props.status ?? InstallmentStatus.Pendiente
    this.notes = props.notes ?? null
  }

  updateStatus(status: InstallmentStatus) {
    this.status = status
  }

  annul() {
    this.status = InstallmentStatus.Anulada
  }
}

export type InstallmentProps = Pick<
  Installment,
  'family' | 'academicYear' | 'month' | 'description' | 'subtotal' | 'total' | 'dueDate'
> &
  Partial<Pick<Installment, 'discountAmount' | 'surchargeAmount' | 'status' | 'notes'>>
