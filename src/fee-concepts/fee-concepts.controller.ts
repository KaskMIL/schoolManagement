import { RequirePermission } from '@/auth/decorators/require-permission.decorator';
import { UuidPipe } from '@/common/uuid.pipe';
import { ZodPipe } from '@/common/zod.pipe';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import { FeeConceptsService } from './fee-concepts.service';
import { CreateFeeConcept, createFeeConceptSchema } from './schemas/create-fee-concept.schema';
import { UpdateFeeConcept, updateFeeConceptSchema } from './schemas/update-fee-concept.schema';

const listQuerySchema = z.object({ institutionId: z.string().uuid() });

@Controller('fee-concepts')
export class FeeConceptsController {
  constructor(private readonly feeConceptsService: FeeConceptsService) {}

  @Get()
  @RequirePermission('fee-concepts:list')
  async listFeeConcepts(
    @Query(new ZodPipe(listQuerySchema)) query: { institutionId: string },
  ) {
    return this.feeConceptsService.listFeeConcepts(query.institutionId);
  }

  @Post()
  @RequirePermission('fee-concepts:create')
  async createFeeConcept(
    @Body(new ZodPipe(createFeeConceptSchema)) data: CreateFeeConcept,
  ) {
    return this.feeConceptsService.createFeeConcept(data);
  }

  @Patch(':conceptId')
  @RequirePermission('fee-concepts:update')
  async updateFeeConcept(
    @Param('conceptId', UuidPipe) conceptId: string,
    @Body(new ZodPipe(updateFeeConceptSchema)) data: UpdateFeeConcept,
  ) {
    return this.feeConceptsService.updateFeeConcept(conceptId, data);
  }

  @Post(':conceptId/activate')
  @RequirePermission('fee-concepts:update')
  async activateFeeConcept(@Param('conceptId', UuidPipe) conceptId: string) {
    return this.feeConceptsService.toggleFeeConcept(conceptId, true);
  }

  @Post(':conceptId/deactivate')
  @RequirePermission('fee-concepts:update')
  async deactivateFeeConcept(@Param('conceptId', UuidPipe) conceptId: string) {
    return this.feeConceptsService.toggleFeeConcept(conceptId, false);
  }
}
