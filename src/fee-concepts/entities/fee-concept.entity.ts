import { Entity, Enum, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core';
import * as uuid from 'uuid';
import { Institution } from '../../institutions/entities/institution.entity';
import { FeeConceptType } from './fee-concept-type.enum';

@Entity({ tableName: 'fee_concepts' })
export class FeeConcept {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7();

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date();

  @ManyToOne(() => Institution, { ref: true })
  institution: Ref<Institution>;

  @Property({ type: 'text' })
  name: string;

  @Enum({ items: () => FeeConceptType, nativeEnumName: 'fee_concept_type' })
  type: FeeConceptType;

  @Property()
  isRecurring: boolean;

  @Property()
  isActive = true;

  @Property({ type: 'text', nullable: true })
  description: string | null = null;

  constructor(props: FeeConceptProps) {
    this.institution = props.institution;
    this.name = props.name;
    this.type = props.type;
    this.isRecurring = props.isRecurring;
    this.description = props.description ?? null;
  }

  update(data: FeeConceptUpdate) {
    this.name = data.name;
    this.type = data.type;
    this.isRecurring = data.isRecurring;
    this.description = data.description ?? null;
  }

  activate() { this.isActive = true; }
  deactivate() { this.isActive = false; }
}

export type FeeConceptProps = Pick<FeeConcept, 'institution' | 'name' | 'type' | 'isRecurring'> &
  Partial<Pick<FeeConcept, 'description'>>;

export type FeeConceptUpdate = Pick<FeeConcept, 'name' | 'type' | 'isRecurring'> &
  Partial<Pick<FeeConcept, 'description'>>;
