import {
  Entity,
  Enum,
  ManyToOne,
  PrimaryKey,
  Property,
  Ref,
} from '@mikro-orm/core';
import * as uuid from 'uuid';
import { EnrollmentStatus } from './enrollment-status.enum';
import { Level } from './level.enum';
import { Section } from './section.enum';
import { Shift } from './shift.enum';
import { Student } from './student.entity';

@Entity({ tableName: 'enrollments' })
export class Enrollment {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7();

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date();

  @ManyToOne(() => Student, { ref: true })
  student: Ref<Student>;

  @Property({ type: 'integer' })
  academicYear: number;

  @Enum({ items: () => Level, nativeEnumName: 'education_level' })
  level: Level;

  @Property({ type: 'text' })
  gradeOrRoom: string;

  @Enum({ items: () => Section, nativeEnumName: 'section_type' })
  section: Section;

  @Enum({ items: () => Shift, nativeEnumName: 'shift_type' })
  shift: Shift;

  @Enum({ items: () => EnrollmentStatus, nativeEnumName: 'enrollment_status' })
  status: EnrollmentStatus = EnrollmentStatus.Inscripto;

  @Property({ type: 'date', nullable: true })
  enrollmentDate: Date | null = null;

  @Property({ type: 'text', nullable: true })
  notes: string | null = null;

  constructor(props: EnrollmentProps) {
    this.student = props.student;
    this.academicYear = props.academicYear;
    this.level = props.level;
    this.gradeOrRoom = props.gradeOrRoom;
    this.section = props.section;
    this.shift = props.shift;
    this.status = props.status ?? EnrollmentStatus.Inscripto;
    this.enrollmentDate = props.enrollmentDate ?? null;
    this.notes = props.notes ?? null;
  }

  update(data: EnrollmentUpdate) {
    this.academicYear = data.academicYear;
    this.level = data.level;
    this.gradeOrRoom = data.gradeOrRoom;
    this.section = data.section;
    this.shift = data.shift;
    this.status = data.status ?? this.status;
    this.enrollmentDate = data.enrollmentDate ?? null;
    this.notes = data.notes ?? null;
  }
}

export type EnrollmentProps = Pick<
  Enrollment,
  'student' | 'academicYear' | 'level' | 'gradeOrRoom' | 'section' | 'shift'
> &
  Partial<Pick<Enrollment, 'status' | 'enrollmentDate' | 'notes'>>;

export type EnrollmentUpdate = Pick<
  Enrollment,
  'academicYear' | 'level' | 'gradeOrRoom' | 'section' | 'shift'
> &
  Partial<Pick<Enrollment, 'status' | 'enrollmentDate' | 'notes'>>;
