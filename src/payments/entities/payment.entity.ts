import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Ref,
} from '@mikro-orm/core'
import * as uuid from 'uuid'
import { Family } from '../../families/entities/family.entity'
import { User } from '../../users/entities/user.entity'
import { PaymentAllocation } from './payment-allocation.entity'
import { PaymentMethod } from './payment-method.enum'
import { Receipt } from './receipt.entity'

@Entity({ tableName: 'payments' })
export class Payment {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7()

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date()

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date()

  @ManyToOne(() => Family, { ref: true })
  family: Ref<Family>

  @Property({ columnType: 'numeric(10,2)' })
  amount: string

  @Property({ type: 'date' })
  paymentDate: Date

  @Enum({ items: () => PaymentMethod, nativeEnumName: 'payment_method' })
  method: PaymentMethod

  /** Nro de transferencia, ID MercadoPago, etc. */
  @Property({ type: 'text', nullable: true })
  reference: string | null = null

  @ManyToOne(() => User, { ref: true })
  receivedBy: Ref<User>

  @Property({ type: 'text', nullable: true })
  notes: string | null = null

  @OneToOne(() => Receipt, (r) => r.payment, { mappedBy: 'payment', nullable: true })
  receipt: Receipt | null = null

  /** Asignaciones de este pago a cuotas específicas (puede ser vacío para pagos a cuenta) */
  @OneToMany(() => PaymentAllocation, (a) => a.payment, { cascade: [] })
  allocations = new Collection<PaymentAllocation>(this)

  constructor(props: PaymentProps) {
    this.family = props.family
    this.amount = props.amount
    this.paymentDate = props.paymentDate
    this.method = props.method
    this.reference = props.reference ?? null
    this.receivedBy = props.receivedBy
    this.notes = props.notes ?? null
  }
}

export type PaymentProps = Pick<
  Payment,
  'family' | 'amount' | 'paymentDate' | 'method' | 'receivedBy'
> &
  Partial<Pick<Payment, 'reference' | 'notes'>>
