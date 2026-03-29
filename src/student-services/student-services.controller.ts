import { RequirePermission } from '@/auth/decorators/require-permission.decorator';
import { UuidPipe } from '@/common/uuid.pipe';
import { ZodPipe } from '@/common/zod.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { StudentServicesService } from './student-services.service';
import {
  CreateStudentService,
  createStudentServiceSchema,
} from './schemas/create-student-service.schema';
import {
  UpdateStudentService,
  updateStudentServiceSchema,
} from './schemas/update-student-service.schema';

@Controller('students/:studentId/services')
export class StudentServicesController {
  constructor(private readonly studentServicesService: StudentServicesService) {}

  @Get()
  @RequirePermission('students:services:list')
  async listServices(@Param('studentId', UuidPipe) studentId: string) {
    return this.studentServicesService.listServices(studentId);
  }

  @Post()
  @RequirePermission('students:services:create')
  async createService(
    @Param('studentId', UuidPipe) studentId: string,
    @Body(new ZodPipe(createStudentServiceSchema)) data: CreateStudentService,
  ) {
    return this.studentServicesService.createService(studentId, data);
  }

  @Patch(':serviceId')
  @RequirePermission('students:services:update')
  async updateService(
    @Param('studentId', UuidPipe) studentId: string,
    @Param('serviceId', UuidPipe) serviceId: string,
    @Body(new ZodPipe(updateStudentServiceSchema)) data: UpdateStudentService,
  ) {
    return this.studentServicesService.updateService(serviceId, data);
  }

  @Delete(':serviceId')
  @RequirePermission('students:services:delete')
  async deleteService(
    @Param('studentId', UuidPipe) studentId: string,
    @Param('serviceId', UuidPipe) serviceId: string,
  ) {
    return this.studentServicesService.deleteService(serviceId);
  }
}
