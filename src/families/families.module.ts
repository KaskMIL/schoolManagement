import { Module } from '@nestjs/common';
import { FamiliesController } from './families.controller';
import { FamiliesRepository } from './families.repository';
import { FamiliesService } from './families.service';

@Module({
  controllers: [FamiliesController],
  providers: [FamiliesRepository, FamiliesService],
  exports: [FamiliesRepository],
})
export class FamiliesModule {}
