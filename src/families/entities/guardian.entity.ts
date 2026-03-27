import { Entity, Enum, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core';
import * as uuid from 'uuid';
import { Family } from './family.entity';
import { Relationship } from './relationship.enum';

@Entity({ tableName: 'guardians' })
export class Guardian {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7();

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date();

  @ManyToOne(() => Family, { ref: true })
  family: Ref<Family>;

  @Property({ type: 'text' })
  firstName: string;

  @Property({ type: 'text' })
  lastName: string;

  @Property({ type: 'text', nullable: true })
  dni: string | null = null;

  @Property({ type: 'text', nullable: true })
  cuitCuil: string | null = null;

  @Enum({ items: () => Relationship, nativeEnumName: 'relationship' })
  relationship: Relationship;

  @Property({ type: 'text', nullable: true })
  phone: string | null = null;

  @Property({ type: 'text', nullable: true })
  email: string | null = null;

  @Property({ type: 'boolean' })
  isPrimaryContact = false;

  @Property({ type: 'text', nullable: true })
  occupation: string | null = null;

  @Property({ type: 'text', nullable: true })
  employer: string | null = null;

  @Property({ type: 'text', nullable: true })
  notes: string | null = null;

  constructor(props: GuardianProps) {
    this.family = props.family;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.relationship = props.relationship;
    this.dni = props.dni ?? null;
    this.cuitCuil = props.cuitCuil ?? null;
    this.phone = props.phone ?? null;
    this.email = props.email ?? null;
    this.isPrimaryContact = props.isPrimaryContact ?? false;
    this.occupation = props.occupation ?? null;
    this.employer = props.employer ?? null;
    this.notes = props.notes ?? null;
  }

  update(data: GuardianUpdate) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.relationship = data.relationship;
    this.dni = data.dni ?? null;
    this.cuitCuil = data.cuitCuil ?? null;
    this.phone = data.phone ?? null;
    this.email = data.email ?? null;
    this.isPrimaryContact = data.isPrimaryContact ?? false;
    this.occupation = data.occupation ?? null;
    this.employer = data.employer ?? null;
    this.notes = data.notes ?? null;
  }
}

export type GuardianProps = Pick<Guardian, 'family' | 'firstName' | 'lastName' | 'relationship'> &
  Partial<
    Pick<
      Guardian,
      | 'dni'
      | 'cuitCuil'
      | 'phone'
      | 'email'
      | 'isPrimaryContact'
      | 'occupation'
      | 'employer'
      | 'notes'
    >
  >;

export type GuardianUpdate = Pick<Guardian, 'firstName' | 'lastName' | 'relationship'> &
  Partial<
    Pick<
      Guardian,
      | 'dni'
      | 'cuitCuil'
      | 'phone'
      | 'email'
      | 'isPrimaryContact'
      | 'occupation'
      | 'employer'
      | 'notes'
    >
  >;
