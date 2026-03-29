import { Entity, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core';
import * as uuid from 'uuid';
import { FeeConcept } from '../../fee-concepts/entities/fee-concept.entity';
import { PriceTier } from '../../price-tiers/entities/price-tier.entity';

@Entity({ tableName: 'fee_prices' })
export class FeePrice {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7();

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date();

  @ManyToOne(() => FeeConcept, { ref: true })
  feeConcept: Ref<FeeConcept>;

  /** null para conceptos de tipo servicio sin distinción de ciclo */
  @ManyToOne(() => PriceTier, { ref: true, nullable: true })
  priceTier: Ref<PriceTier> | null = null;

  @Property({ type: 'integer' })
  academicYear: number;

  /** Monto en formato string — almacenado como numeric(10,2) */
  @Property({ columnType: 'numeric(10,2)' })
  amount: string;

  constructor(props: FeePriceProps) {
    this.feeConcept = props.feeConcept;
    this.priceTier = props.priceTier ?? null;
    this.academicYear = props.academicYear;
    this.amount = props.amount;
  }

  update(data: FeePriceUpdate) {
    this.priceTier = data.priceTier ?? null;
    this.academicYear = data.academicYear;
    this.amount = data.amount;
  }
}

export type FeePriceProps = Pick<FeePrice, 'feeConcept' | 'academicYear' | 'amount'> &
  Partial<Pick<FeePrice, 'priceTier'>>;

export type FeePriceUpdate = Pick<FeePrice, 'academicYear' | 'amount'> &
  Partial<Pick<FeePrice, 'priceTier'>>;
