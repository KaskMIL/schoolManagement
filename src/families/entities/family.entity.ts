import {
  Cascade,
  Collection,
  Entity,
  Enum,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import * as uuid from 'uuid';
import { Guardian } from './guardian.entity';
import { FamilyStatus } from './family-status.enum';

@Entity({ tableName: 'families' })
export class Family {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7();

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date();

  @Enum({ items: () => FamilyStatus, nativeEnumName: 'family_status' })
  status: FamilyStatus = FamilyStatus.Activa;

  @Property({ type: 'text' })
  familyName: string;

  @Property({ type: 'text', nullable: true })
  primaryEmail: string | null = null;

  @Property({ type: 'text', nullable: true })
  primaryPhone: string | null = null;

  @Property({ type: 'text', nullable: true })
  address: string | null = null;

  @Property({ type: 'text', nullable: true })
  locality: string | null = null;

  @Property({ type: 'text', nullable: true })
  notes: string | null = null;

  @OneToMany(() => Guardian, (g) => g.family, { cascade: [Cascade.ALL] })
  readonly guardians: Collection<Guardian> = new Collection<Guardian>(this);

  constructor(props: FamilyProps) {
    this.familyName = props.familyName;
    this.primaryEmail = props.primaryEmail ?? null;
    this.primaryPhone = props.primaryPhone ?? null;
    this.address = props.address ?? null;
    this.locality = props.locality ?? null;
    this.notes = props.notes ?? null;
  }

  update(data: FamilyUpdate) {
    this.familyName = data.familyName;
    this.primaryEmail = data.primaryEmail ?? null;
    this.primaryPhone = data.primaryPhone ?? null;
    this.address = data.address ?? null;
    this.locality = data.locality ?? null;
    this.notes = data.notes ?? null;
  }

  deactivate() {
    this.status = FamilyStatus.Inactiva;
  }

  reactivate() {
    this.status = FamilyStatus.Activa;
  }

  isActive() {
    return this.status === FamilyStatus.Activa;
  }
}

export type FamilyProps = Pick<Family, 'familyName'> &
  Partial<Pick<Family, 'primaryEmail' | 'primaryPhone' | 'address' | 'locality' | 'notes'>>;

export type FamilyUpdate = Pick<Family, 'familyName'> &
  Partial<Pick<Family, 'primaryEmail' | 'primaryPhone' | 'address' | 'locality' | 'notes'>>;
