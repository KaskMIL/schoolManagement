import { PaginationOptions } from '@/common/pagination-options.schema';
import { FilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { Enrollment } from './entities/enrollment.entity';
import { StudentStatus } from './entities/student-status.enum';
import { Student } from './entities/student.entity';

export interface ListStudentsFilters {
  familyId?: string;
  institutionId?: string;
  status?: StudentStatus;
  search?: string;
}

@Injectable()
export class StudentsRepository {
  constructor(private readonly em: EntityManager) {}

  async findAll(opts: PaginationOptions, filters: ListStudentsFilters) {
    const where = {
      ...(filters.familyId && { family: { id: filters.familyId } }),
      ...(filters.institutionId && { institution: { id: filters.institutionId } }),
      ...(filters.status && { status: filters.status }),
      ...(filters.search && {
        $or: [
          { firstName: { $ilike: `%${filters.search}%` } },
          { lastName: { $ilike: `%${filters.search}%` } },
        ],
      }),
    } as FilterQuery<Student>;

    const [items, total] = await this.em.findAndCount(Student, where, {
      offset: (opts.page - 1) * opts.limit,
      limit: opts.limit,
      orderBy: { lastName: 'ASC', firstName: 'ASC' },
      populate: ['family', 'institution'],
    });
    return { total, items };
  }

  async findOneById(id: string) {
    return this.em.findOne(
      Student,
      { id },
      { populate: ['family', 'institution', 'enrollments', 'emergencyContacts'] },
    );
  }

  async findEnrollment(studentId: string, enrollmentId: string) {
    return this.em.findOne(Enrollment, { id: enrollmentId, student: { id: studentId } });
  }

  async findEmergencyContact(studentId: string, contactId: string) {
    return this.em.findOne(EmergencyContact, { id: contactId, student: { id: studentId } });
  }
}
