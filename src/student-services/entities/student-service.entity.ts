import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Ref,
} from '@mikro-orm/core';
import * as uuid from 'uuid';
import { FeeConcept } from '../../fee-concepts/entities/fee-concept.entity';
import { Student } from '../../students/entities/student.entity';

@Entity({ tableName: 'student_services' })
export class StudentService {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7();

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date();

  @ManyToOne(() => Student, { ref: true })
  student: Ref<Student>;

  @ManyToOne(() => FeeConcept, { ref: true })
  feeConcept: Ref<FeeConcept>;

  @Property({ type: 'integer' })
  academicYear: number;

  @Property({ type: 'date' })
  activeFrom: Date;

  @Property({ type: 'date', nullable: true })
  activeTo: Date | null = null;

  @Property({ type: 'text', nullable: true })
  notes: string | null = null;

  constructor(props: StudentServiceProps) {
    this.student = props.student;
    this.feeConcept = props.feeConcept;
    this.academicYear = props.academicYear;
    this.activeFrom = props.activeFrom;
    this.activeTo = props.activeTo ?? null;
    this.notes = props.notes ?? null;
  }

  update(data: StudentServiceUpdate) {
    this.academicYear = data.academicYear;
    this.activeFrom = data.activeFrom;
    this.activeTo = data.activeTo ?? null;
    this.notes = data.notes ?? null;
  }
}

export type StudentServiceProps = Pick<
  StudentService,
  'student' | 'feeConcept' | 'academicYear' | 'activeFrom'
> &
  Partial<Pick<StudentService, 'activeTo' | 'notes'>>;

export type StudentServiceUpdate = Pick<
  StudentService,
  'academicYear' | 'activeFrom'
> &
  Partial<Pick<StudentService, 'activeTo' | 'notes'>>;
