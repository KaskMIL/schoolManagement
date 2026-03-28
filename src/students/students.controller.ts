import { RequirePermission } from '@/auth/decorators/require-permission.decorator';
import {
  PaginationOptions,
  paginationOptionsSchema,
} from '@/common/pagination-options.schema';
import { UuidPipe } from '@/common/uuid.pipe';
import { ZodPipe } from '@/common/zod.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { z } from 'zod';
import { StudentStatus } from './entities/student-status.enum';
import {
  CreateStudent,
  createStudentSchema,
} from './schemas/create-student.schema';
import {
  UpdateStudent,
  updateStudentSchema,
} from './schemas/update-student.schema';
import {
  CreateEnrollment,
  createEnrollmentSchema,
} from './schemas/create-enrollment.schema';
import {
  UpdateEnrollment,
  updateEnrollmentSchema,
} from './schemas/update-enrollment.schema';
import {
  CreateEmergencyContact,
  createEmergencyContactSchema,
} from './schemas/create-emergency-contact.schema';
import {
  UpdateEmergencyContact,
  updateEmergencyContactSchema,
} from './schemas/update-emergency-contact.schema';
import { ListStudentsFilters } from './students.repository';
import { StudentsService } from './students.service';

const listStudentsQuerySchema = paginationOptionsSchema.extend({
  familyId: z.string().uuid().optional(),
  institutionId: z.string().uuid().optional(),
  status: z.enum(StudentStatus).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema> & PaginationOptions;

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @RequirePermission('students:create')
  async createStudent(@Body(new ZodPipe(createStudentSchema)) data: CreateStudent) {
    return this.studentsService.createStudent(data);
  }

  @Get()
  @RequirePermission('students:list')
  async listStudents(
    @Query(new ZodPipe(listStudentsQuerySchema)) query: ListStudentsQuery,
  ) {
    const { page, limit, ...filters } = query;
    return this.studentsService.listStudents({ page, limit }, filters as ListStudentsFilters);
  }

  @Get(':studentId')
  @RequirePermission('students:show')
  async getStudent(@Param('studentId', UuidPipe) studentId: string) {
    return this.studentsService.getStudent(studentId);
  }

  @Patch(':studentId')
  @RequirePermission('students:update')
  async updateStudent(
    @Param('studentId', UuidPipe) studentId: string,
    @Body(new ZodPipe(updateStudentSchema)) data: UpdateStudent,
  ) {
    return this.studentsService.updateStudent(studentId, data);
  }

  @Post(':studentId/enrollments')
  @RequirePermission('students:enrollments:create')
  async createEnrollment(
    @Param('studentId', UuidPipe) studentId: string,
    @Body(new ZodPipe(createEnrollmentSchema)) data: CreateEnrollment,
  ) {
    return this.studentsService.createEnrollment(studentId, data);
  }

  @Patch(':studentId/enrollments/:enrollmentId')
  @RequirePermission('students:enrollments:update')
  async updateEnrollment(
    @Param('studentId', UuidPipe) studentId: string,
    @Param('enrollmentId', UuidPipe) enrollmentId: string,
    @Body(new ZodPipe(updateEnrollmentSchema)) data: UpdateEnrollment,
  ) {
    return this.studentsService.updateEnrollment(studentId, enrollmentId, data);
  }

  @Post(':studentId/emergency-contacts')
  @RequirePermission('students:contacts:create')
  async createEmergencyContact(
    @Param('studentId', UuidPipe) studentId: string,
    @Body(new ZodPipe(createEmergencyContactSchema)) data: CreateEmergencyContact,
  ) {
    return this.studentsService.createEmergencyContact(studentId, data);
  }

  @Patch(':studentId/emergency-contacts/:contactId')
  @RequirePermission('students:contacts:update')
  async updateEmergencyContact(
    @Param('studentId', UuidPipe) studentId: string,
    @Param('contactId', UuidPipe) contactId: string,
    @Body(new ZodPipe(updateEmergencyContactSchema)) data: UpdateEmergencyContact,
  ) {
    return this.studentsService.updateEmergencyContact(studentId, contactId, data);
  }

  @Delete(':studentId/emergency-contacts/:contactId')
  @RequirePermission('students:contacts:delete')
  async deleteEmergencyContact(
    @Param('studentId', UuidPipe) studentId: string,
    @Param('contactId', UuidPipe) contactId: string,
  ) {
    return this.studentsService.deleteEmergencyContact(studentId, contactId);
  }
}
