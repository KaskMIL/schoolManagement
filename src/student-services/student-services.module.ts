import { Module } from '@nestjs/common';
import { FeeConceptsModule } from '../fee-concepts/fee-concepts.module';
import { StudentsModule } from '../students/students.module';
import { StudentServicesController } from './student-services.controller';
import { StudentServicesRepository } from './student-services.repository';
import { StudentServicesService } from './student-services.service';

@Module({
  imports: [StudentsModule, FeeConceptsModule],
  controllers: [StudentServicesController],
  providers: [StudentServicesRepository, StudentServicesService],
})
export class StudentServicesModule {}
