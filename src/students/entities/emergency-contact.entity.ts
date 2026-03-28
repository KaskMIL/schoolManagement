import { Entity, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core';
import * as uuid from 'uuid';
import { Student } from './student.entity';

@Entity({ tableName: 'emergency_contacts' })
export class EmergencyContact {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7();

  @ManyToOne(() => Student, { ref: true })
  student: Ref<Student>;

  @Property({ type: 'text' })
  name: string;

  @Property({ type: 'text' })
  phone: string;

  @Property({ type: 'text' })
  relationship: string;

  @Property({ type: 'integer' })
  priorityOrder: number = 1;

  constructor(props: EmergencyContactProps) {
    this.student = props.student;
    this.name = props.name;
    this.phone = props.phone;
    this.relationship = props.relationship;
    this.priorityOrder = props.priorityOrder ?? 1;
  }

  update(data: EmergencyContactUpdate) {
    this.name = data.name;
    this.phone = data.phone;
    this.relationship = data.relationship;
    this.priorityOrder = data.priorityOrder ?? this.priorityOrder;
  }
}

export type EmergencyContactProps = Pick<EmergencyContact, 'student' | 'name' | 'phone' | 'relationship'> &
  Partial<Pick<EmergencyContact, 'priorityOrder'>>;

export type EmergencyContactUpdate = Pick<EmergencyContact, 'name' | 'phone' | 'relationship'> &
  Partial<Pick<EmergencyContact, 'priorityOrder'>>;
