import {
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import * as uuid from 'uuid';

@Entity({ tableName: 'institutions' })
export class Institution {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7();

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date();

  @Property({ type: 'text' })
  name: string;

  @Property({ type: 'text', nullable: true })
  cue: string | null = null;

  @Property({ type: 'text', nullable: true })
  diegepDipregep: string | null = null;

  @Property({ type: 'text', nullable: true })
  address: string | null = null;

  @Property({ type: 'text', nullable: true })
  phone: string | null = null;

  @Property({ type: 'text', nullable: true })
  email: string | null = null;

  @Property({ type: 'text', nullable: true })
  logoUrl: string | null = null;

  constructor(props: InstitutionProps) {
    this.name = props.name;
  }

  update(data: InstitutionUpdate) {
    this.name = data.name;
    this.cue = data.cue ?? null;
    this.diegepDipregep = data.diegepDipregep ?? null;
    this.address = data.address ?? null;
    this.phone = data.phone ?? null;
    this.email = data.email ?? null;
    this.logoUrl = data.logoUrl ?? null;
  }
}

export type InstitutionProps = Pick<Institution, 'name'>;
export type InstitutionUpdate = Pick<Institution, 'name'> &
  Partial<Pick<Institution, 'cue' | 'diegepDipregep' | 'address' | 'phone' | 'email' | 'logoUrl'>>;
