import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Ref,
} from '@mikro-orm/core'
import * as uuid from 'uuid'
import { FeeConcept } from '../../fee-concepts/entities/fee-concept.entity'
import { Student } from '../../students/entities/student.entity'
import { Installment } from './installment.entity'

@Entity({ tableName: 'installment_details' })
export class InstallmentDetail {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7()

  @ManyToOne(() => Installment, { ref: true })
  installment: Ref<Installment>

  /** Puede ser null para líneas de concepto a nivel familia sin alumno específico */
  @ManyToOne(() => Student, { ref: true, nullable: true })
  student: Ref<Student> | null = null

  @ManyToOne(() => FeeConcept, { ref: true })
  feeConcept: Ref<FeeConcept>

  /** Texto descriptivo: "Arancel — Sala de 4 (Juan García)" */
  @Property({ type: 'text' })
  description: string

  @Property({ columnType: 'numeric(10,2)' })
  amount: string

  @Property({ columnType: 'numeric(10,2)' })
  discountAmount: string = '0.00'

  /** amount - discountAmount */
  @Property({ columnType: 'numeric(10,2)' })
  finalAmount: string

  constructor(props: InstallmentDetailProps) {
    this.installment = props.installment
    this.student = props.student ?? null
    this.feeConcept = props.feeConcept
    this.description = props.description
    this.amount = props.amount
    this.discountAmount = props.discountAmount ?? '0.00'
    this.finalAmount = props.finalAmount
  }
}

export type InstallmentDetailProps = Pick<
  InstallmentDetail,
  'installment' | 'feeConcept' | 'description' | 'amount' | 'finalAmount'
> &
  Partial<Pick<InstallmentDetail, 'student' | 'discountAmount'>>
