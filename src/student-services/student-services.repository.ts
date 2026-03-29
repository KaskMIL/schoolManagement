import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { StudentService } from './entities/student-service.entity';

@Injectable()
export class StudentServicesRepository {
  constructor(private readonly em: EntityManager) {}

  async findByStudent(studentId: string) {
    return this.em.findAll(StudentService, {
      where: { student: { id: studentId } },
      populate: ['feeConcept'],
      orderBy: { academicYear: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOneById(id: string) {
    return this.em.findOne(StudentService, { id });
  }

  async findByStudentAndYear(studentId: string, academicYear: number) {
    return this.em.findAll(StudentService, {
      where: { student: { id: studentId }, academicYear },
      populate: ['feeConcept'],
    });
  }
}
