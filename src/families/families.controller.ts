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
import { FamilyStatus } from './entities/family-status.enum';
import { FamiliesService } from './families.service';
import { CreateFamily, createFamilySchema } from './schemas/create-family.schema';
import { CreateGuardian, createGuardianSchema } from './schemas/create-guardian.schema';
import { UpdateFamily, updateFamilySchema } from './schemas/update-family.schema';
import { UpdateGuardian, updateGuardianSchema } from './schemas/update-guardian.schema';
import { z } from 'zod';

const listFamiliesQuerySchema = paginationOptionsSchema.extend({
  status: z.enum(FamilyStatus).optional(),
  search: z.string().max(100).optional(),
});

@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  @RequirePermission('families:create')
  async createFamily(@Body(new ZodPipe(createFamilySchema)) data: CreateFamily) {
    return this.familiesService.createFamily(data);
  }

  @Get()
  @RequirePermission('families:list')
  async listFamilies(
    @Query(new ZodPipe(listFamiliesQuerySchema))
    query: PaginationOptions & { status?: FamilyStatus; search?: string },
  ) {
    const { status, search, ...opts } = query;
    return this.familiesService.listFamilies(opts, status, search);
  }

  @Get(':familyId')
  @RequirePermission('families:show')
  async getFamily(@Param('familyId', UuidPipe) familyId: string) {
    return this.familiesService.getFamily(familyId);
  }

  @Patch(':familyId')
  @RequirePermission('families:update')
  async updateFamily(
    @Param('familyId', UuidPipe) familyId: string,
    @Body(new ZodPipe(updateFamilySchema)) data: UpdateFamily,
  ) {
    return this.familiesService.updateFamily(familyId, data);
  }

  @Post(':familyId/deactivate')
  @RequirePermission('families:deactivate')
  async deactivateFamily(@Param('familyId', UuidPipe) familyId: string) {
    return this.familiesService.deactivateFamily(familyId);
  }

  @Post(':familyId/reactivate')
  @RequirePermission('families:reactivate')
  async reactivateFamily(@Param('familyId', UuidPipe) familyId: string) {
    return this.familiesService.reactivateFamily(familyId);
  }

  @Post(':familyId/guardians')
  @RequirePermission('families:guardians:create')
  async createGuardian(
    @Param('familyId', UuidPipe) familyId: string,
    @Body(new ZodPipe(createGuardianSchema)) data: CreateGuardian,
  ) {
    return this.familiesService.createGuardian(familyId, data);
  }

  @Patch(':familyId/guardians/:guardianId')
  @RequirePermission('families:guardians:update')
  async updateGuardian(
    @Param('familyId', UuidPipe) familyId: string,
    @Param('guardianId', UuidPipe) guardianId: string,
    @Body(new ZodPipe(updateGuardianSchema)) data: UpdateGuardian,
  ) {
    return this.familiesService.updateGuardian(familyId, guardianId, data);
  }

  @Delete(':familyId/guardians/:guardianId')
  @RequirePermission('families:guardians:delete')
  async deleteGuardian(
    @Param('familyId', UuidPipe) familyId: string,
    @Param('guardianId', UuidPipe) guardianId: string,
  ) {
    return this.familiesService.deleteGuardian(familyId, guardianId);
  }
}
