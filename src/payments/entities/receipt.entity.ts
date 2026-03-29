import {
  Entity,
  OneToOne,
  PrimaryKey,
  Property,
  Ref,
} from '@mikro-orm/core'
import * as uuid from 'uuid'
import { Payment } from './payment.entity'

@Entity({ tableName: 'receipts' })
export class Receipt {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7()

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date()

  @OneToOne(() => Payment, { ref: true, owner: true })
  payment: Ref<Payment>

  /** Correlativo por año: 1, 2, 3... */
  @Property({ type: 'integer' })
  receiptNumber: number

  @Property({ type: 'integer' })
  academicYear: number

  @Property({ type: 'date' })
  issuedDate: Date

  @Property({ type: 'text', nullable: true })
  notes: string | null = null

  constructor(props: ReceiptProps) {
    this.payment = props.payment
    this.receiptNumber = props.receiptNumber
    this.academicYear = props.academicYear
    this.issuedDate = props.issuedDate
    this.notes = props.notes ?? null
  }
}

export type ReceiptProps = Pick<
  Receipt,
  'payment' | 'receiptNumber' | 'academicYear' | 'issuedDate'
> &
  Partial<Pick<Receipt, 'notes'>>
