import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import * as uuid from 'uuid';

@Entity({ tableName: 'price_tiers' })
export class PriceTier {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7();

  /** jardin | primaria_1 | primaria_2 | secundaria */
  @Property({ type: 'text', unique: true })
  code: string;

  @Property({ type: 'text' })
  name: string;

  @Property({ type: 'smallint' })
  displayOrder: number;

  constructor(props: { code: string; name: string; displayOrder: number }) {
    this.code = props.code;
    this.name = props.name;
    this.displayOrder = props.displayOrder;
  }
}
