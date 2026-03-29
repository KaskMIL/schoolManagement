import { Module } from '@nestjs/common';
import { InstitutionsModule } from '../institutions/institutions.module';
import { FeeConceptsController } from './fee-concepts.controller';
import { FeeConceptsRepository } from './fee-concepts.repository';
import { FeeConceptsService } from './fee-concepts.service';

@Module({
  imports: [InstitutionsModule],
  controllers: [FeeConceptsController],
  providers: [FeeConceptsRepository, FeeConceptsService],
  exports: [FeeConceptsRepository],
})
export class FeeConceptsModule {}
