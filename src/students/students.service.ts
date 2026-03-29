import { Family } from '@/families/entities/family.entity';
import { Institution } from '@/institutions/entities/institution.entity';
import { PaginationOptions } from '@/common/pagination-options.schema';
import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Student } from './entities/student.entity';
import { ListStudentsFilters, StudentsRepository } from './students.repository';
import { CreateStudent } from './schemas/create-student.schema';
import { UpdateStudent } from './schemas/update-student.schema';
import { CreateEnrollment } from './schemas/create-enrollment.schema';
import { UpdateEnrollment } from './schemas/update-enrollment.schema';
import { CreateEmergencyContact } from './schemas/create-emergency-contact.schema';
import { UpdateEmergencyContact } from './schemas/update-emergency-contact.schema';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly em: EntityManager,
  ) {}

  async createStudent(data: CreateStudent) {
    const family = await this.em.findOne(Family, { id: data.familyId });
    if (!family) throw new NotFoundException('Familia no encontrada');

    const institution = await this.em.findOne(Institution, { id: data.institutionId });
    if (!institution) throw new NotFoundException('Institución no encontrada');

    const { familyId, institutionId, ...rest } = data;
    void familyId; void institutionId;
    const student = new Student({
      ...rest,
      family: wrap(family).toReference(),
      institution: wrap(institution).toReference(),
    });
    await this.em.persist(student).flush();
    return student;
  }

  async listStudents(opts: PaginationOptions, filters: ListStudentsFilters) {
    return this.studentsRepository.findAll(opts, filters);
  }

  async getStudent(studentId: string) {
    const student = await this.studentsRepository.findOneById(studentId);
    if (!student) throw new NotFoundException();
    return student;
  }

  async updateStudent(studentId: string, data: UpdateStudent) {
    const student = await this.studentsRepository.findOneById(studentId);
    if (!student) throw new NotFoundException();
    student.update(data);
    await this.em.flush();
    return student;
  }

  async createEnrollment(studentId: string, data: CreateEnrollment) {
    const student = await this.studentsRepository.findOneById(studentId);
    if (!student) throw new NotFoundException();
    const enrollment = new Enrollment({
      ...data,
      student: wrap(student).toReference(),
    });
    await this.em.persist(enrollment).flush();
    return enrollment;
  }

  async updateEnrollment(studentId: string, enrollmentId: string, data: UpdateEnrollment) {
    const enrollment = await this.studentsRepository.findEnrollment(studentId, enrollmentId);
    if (!enrollment) throw new NotFoundException();
    enrollment.update(data);
    await this.em.flush();
    return enrollment;
  }

  async createEmergencyContact(studentId: string, data: CreateEmergencyContact) {
    const student = await this.studentsRepository.findOneById(studentId);
    if (!student) throw new NotFoundException();
    const contact = new EmergencyContact({
      ...data,
      student: wrap(student).toReference(),
    });
    await this.em.persist(contact).flush();
    return contact;
  }

  async updateEmergencyContact(
    studentId: string,
    contactId: string,
    data: UpdateEmergencyContact,
  ) {
    const contact = await this.studentsRepository.findEmergencyContact(studentId, contactId);
    if (!contact) throw new NotFoundException();
    contact.update(data);
    await this.em.flush();
    return contact;
  }

  async deleteEmergencyContact(studentId: string, contactId: string) {
    const contact = await this.studentsRepository.findEmergencyContact(studentId, contactId);
    if (!contact) throw new NotFoundException();
    await this.em.remove(contact).flush();
  }
}
