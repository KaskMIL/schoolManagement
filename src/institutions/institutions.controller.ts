import { RequirePermission } from '@/auth/decorators/require-permission.decorator';
import { UuidPipe } from '@/common/uuid.pipe';
import { ZodPipe } from '@/common/zod.pipe';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import {
  UpdateInstitution,
  updateInstitutionSchema,
} from './schemas/update-institution.schema';

@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  @RequirePermission('institutions:list')
  async listInstitutions() {
    return this.institutionsService.listInstitutions();
  }

  @Patch(':institutionId')
  @RequirePermission('institutions:update')
  async updateInstitution(
    @Param('institutionId', UuidPipe) institutionId: string,
    @Body(new ZodPipe(updateInstitutionSchema)) data: UpdateInstitution,
  ) {
    return this.institutionsService.updateInstitution(institutionId, data);
  }
}
