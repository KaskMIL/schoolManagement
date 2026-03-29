import { RequirePermission } from '@/auth/decorators/require-permission.decorator'
import { UuidPipe } from '@/common/uuid.pipe'
import { ZodPipe } from '@/common/zod.pipe'
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { z } from 'zod'
import { InstallmentsService } from './installments.service'
import { GenerateInstallment, generateInstallmentSchema } from './schemas/generate-installment.schema'

const listByFamilyQuerySchema = z.object({
  familyId: z.string().uuid(),
})

@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Get()
  @RequirePermission('installments:list')
  async listByFamily(
    @Query(new ZodPipe(listByFamilyQuerySchema)) query: { familyId: string },
  ) {
    return this.installmentsService.listByFamily(query.familyId)
  }

  @Get(':installmentId')
  @RequirePermission('installments:read')
  async getInstallment(@Param('installmentId', UuidPipe) installmentId: string) {
    return this.installmentsService.getInstallment(installmentId)
  }

  @Post()
  @RequirePermission('installments:create')
  async generateInstallment(@Body(new ZodPipe(generateInstallmentSchema)) data: GenerateInstallment) {
    return this.installmentsService.generateInstallment(data)
  }

  @Put(':installmentId/annul')
  @RequirePermission('installments:update')
  async annulInstallment(@Param('installmentId', UuidPipe) installmentId: string) {
    return this.installmentsService.annulInstallment(installmentId)
  }
}
