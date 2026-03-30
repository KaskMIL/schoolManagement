import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Ref,
} from '@mikro-orm/core'
import * as uuid from 'uuid'
import { Installment } from '../../installments/entities/installment.entity'
import { Payment } from './payment.entity'

@Entity({ tableName: 'payment_allocations' })
export class PaymentAllocation {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7()

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date()

  @ManyToOne(() => Payment, { ref: true })
  payment: Ref<Payment>

  @ManyToOne(() => Installment, { ref: true })
  installment: Ref<Installment>

  /** Monto de este pago asignado a esta cuota */
  @Property({ columnType: 'numeric(10,2)' })
  allocatedAmount: string

  constructor(props: PaymentAllocationProps) {
    this.payment = props.payment
    this.installment = props.installment
    this.allocatedAmount = props.allocatedAmount
  }
}

export type PaymentAllocationProps = Pick<
  PaymentAllocation,
  'payment' | 'installment' | 'allocatedAmount'
>
