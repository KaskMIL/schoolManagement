import { Family } from '@/families/entities/family.entity';
import { Institution } from '@/institutions/entities/institution.entity';
import {
  Cascade,
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Ref,
} from '@mikro-orm/core';
import * as uuid from 'uuid';
import { EmergencyContact } from './emergency-contact.entity';
import { Enrollment } from './enrollment.entity';
import { Gender } from './gender.enum';
import { StudentStatus } from './student-status.enum';

@Entity({ tableName: 'students' })
export class Student {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7();

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date();

  @ManyToOne(() => Family, { ref: true })
  family: Ref<Family>;

  @ManyToOne(() => Institution, { ref: true })
  institution: Ref<Institution>;

  @Enum({ items: () => StudentStatus, nativeEnumName: 'student_status' })
  status: StudentStatus = StudentStatus.Activo;

  @Property({ type: 'text' })
  firstName: string;

  @Property({ type: 'text' })
  lastName: string;

  @Property({ type: 'text', nullable: true })
  dni: string | null = null;

  @Property({ type: 'date', nullable: true })
  birthDate: Date | null = null;

  @Enum({ items: () => Gender, nativeEnumName: 'student_gender', nullable: true })
  gender: Gender | null = null;

  @Property({ type: 'text', nullable: true })
  bloodType: string | null = null;

  @Property({ type: 'text', nullable: true })
  medicalNotes: string | null = null;

  @Property({ type: 'text', nullable: true })
  allergies: string | null = null;

  @Property({ type: 'text', nullable: true })
  healthInsurance: string | null = null;

  @Property({ type: 'text', nullable: true })
  healthInsuranceNumber: string | null = null;

  @Property({ type: 'date', nullable: true })
  enrollmentDate: Date | null = null;

  @Property({ type: 'text', nullable: true })
  notes: string | null = null;

  @OneToMany(() => Enrollment, (e) => e.student, { cascade: [Cascade.ALL] })
  readonly enrollments: Collection<Enrollment> = new Collection<Enrollment>(this);

  @OneToMany(() => EmergencyContact, (c) => c.student, { cascade: [Cascade.ALL] })
  readonly emergencyContacts: Collection<EmergencyContact> = new Collection<EmergencyContact>(this);

  constructor(props: StudentProps) {
    this.family = props.family;
    this.institution = props.institution;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.status = props.status ?? StudentStatus.Activo;
    this.dni = props.dni ?? null;
    this.birthDate = props.birthDate ?? null;
    this.gender = props.gender ?? null;
    this.bloodType = props.bloodType ?? null;
    this.medicalNotes = props.medicalNotes ?? null;
    this.allergies = props.allergies ?? null;
    this.healthInsurance = props.healthInsurance ?? null;
    this.healthInsuranceNumber = props.healthInsuranceNumber ?? null;
    this.enrollmentDate = props.enrollmentDate ?? null;
    this.notes = props.notes ?? null;
  }

  update(data: StudentUpdate) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.status = data.status ?? this.status;
    this.dni = data.dni ?? null;
    this.birthDate = data.birthDate ?? null;
    this.gender = data.gender ?? null;
    this.bloodType = data.bloodType ?? null;
    this.medicalNotes = data.medicalNotes ?? null;
    this.allergies = data.allergies ?? null;
    this.healthInsurance = data.healthInsurance ?? null;
    this.healthInsuranceNumber = data.healthInsuranceNumber ?? null;
    this.enrollmentDate = data.enrollmentDate ?? null;
    this.notes = data.notes ?? null;
  }
}

export type StudentProps = Pick<Student, 'family' | 'institution' | 'firstName' | 'lastName'> &
  Partial<
    Pick<
      Student,
      | 'status'
      | 'dni'
      | 'birthDate'
      | 'gender'
      | 'bloodType'
      | 'medicalNotes'
      | 'allergies'
      | 'healthInsurance'
      | 'healthInsuranceNumber'
      | 'enrollmentDate'
      | 'notes'
    >
  >;

export type StudentUpdate = Pick<Student, 'firstName' | 'lastName'> &
  Partial<
    Pick<
      Student,
      | 'status'
      | 'dni'
      | 'birthDate'
      | 'gender'
      | 'bloodType'
      | 'medicalNotes'
      | 'allergies'
      | 'healthInsurance'
      | 'healthInsuranceNumber'
      | 'enrollmentDate'
      | 'notes'
    >
  >;
