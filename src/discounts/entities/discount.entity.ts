import {
  Collection,
  Entity,
  Enum,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'
import * as uuid from 'uuid'
import { AppliedDiscount } from './applied-discount.entity'
import { DiscountType } from './discount-type.enum'

/**
 * Catálogo de descuentos disponibles.
 * Los tipos automáticos (hermano, pronto_pago) se aplican sin AppliedDiscount.
 * Los tipos manuales (beca, docente_hijo) requieren un AppliedDiscount por alumno+año.
 */
@Entity({ tableName: 'discounts' })
export class Discount {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7()

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date()

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date()

  @Enum({ items: () => DiscountType, nativeEnumName: 'discount_type', unique: true })
  type: DiscountType

  @Property({ type: 'text' })
  name: string

  /** Porcentaje (0-100). Almacenado como numeric para consistencia. */
  @Property({ columnType: 'numeric(5,2)' })
  percentage: string

  @Property({ type: 'boolean' })
  isActive: boolean = true

  @OneToMany(() => AppliedDiscount, (a) => a.discount, { cascade: [] })
  appliedDiscounts = new Collection<AppliedDiscount>(this)

  constructor(props: DiscountProps) {
    this.type = props.type
    this.name = props.name
    this.percentage = props.percentage
    this.isActive = props.isActive ?? true
  }

  deactivate() {
    this.isActive = false
  }

  activate() {
    this.isActive = true
  }
}

export type DiscountProps = Pick<Discount, 'type' | 'name' | 'percentage'> &
  Partial<Pick<Discount, 'isActive'>>
