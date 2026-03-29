import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FeeConceptsRepository } from '../fee-concepts/fee-concepts.repository';
import { StudentsRepository } from '../students/students.repository';
import { StudentService } from './entities/student-service.entity';
import { StudentServicesRepository } from './student-services.repository';
import { CreateStudentService } from './schemas/create-student-service.schema';
import { UpdateStudentService } from './schemas/update-student-service.schema';

@Injectable()
export class StudentServicesService {
  constructor(
    private readonly studentServicesRepository: StudentServicesRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly feeConceptsRepository: FeeConceptsRepository,
    private readonly em: EntityManager,
  ) {}

  async listServices(studentId: string) {
    return this.studentServicesRepository.findByStudent(studentId);
  }

  async createService(studentId: string, data: CreateStudentService) {
    const student = await this.studentsRepository.findOneById(studentId);
    if (!student) throw new NotFoundException('Alumno no encontrado');

    const concept = await this.feeConceptsRepository.findOneById(data.feeConceptId);
    if (!concept) throw new NotFoundException('Concepto no encontrado');

    const service = new StudentService({
      student: wrap(student).toReference(),
      feeConcept: wrap(concept).toReference(),
      academicYear: data.academicYear,
      activeFrom: data.activeFrom,
      activeTo: data.activeTo,
      notes: data.notes,
    });
    await this.em.persist(service).flush();
    return service;
  }

  async updateService(serviceId: string, data: UpdateStudentService) {
    const service = await this.studentServicesRepository.findOneById(serviceId);
    if (!service) throw new NotFoundException();
    service.update(data);
    await this.em.flush();
    return service;
  }

  async deleteService(serviceId: string) {
    const service = await this.studentServicesRepository.findOneById(serviceId);
    if (!service) throw new NotFoundException();
    await this.em.remove(service).flush();
  }
}
