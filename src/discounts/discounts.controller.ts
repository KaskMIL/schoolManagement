import { CurrentSession } from '@/auth/decorators/current-session.decorator'
import { RequirePermission } from '@/auth/decorators/require-permission.decorator'
import { Session } from '@/auth/entities/session.entity'
import { UuidPipe } from '@/common/uuid.pipe'
import { ZodPipe } from '@/common/zod.pipe'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { z } from 'zod'
import { DiscountsService } from './discounts.service'
import {
  CreateAppliedDiscount,
  createAppliedDiscountSchema,
} from './schemas/create-applied-discount.schema'
import { UpdateDiscount, updateDiscountSchema } from './schemas/update-discount.schema'

const listAppliedQuerySchema = z.object({
  studentId: z.string().uuid(),
  academicYear: z.coerce.number().int().min(2020).max(2099),
})

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  /** GET /api/discounts — catálogo completo */
  @Get()
  @RequirePermission('discounts:list')
  async listDiscounts() {
    return this.discountsService.listDiscounts()
  }

  /** PATCH /api/discounts/:id — actualizar nombre o porcentaje */
  @Patch(':id')
  @RequirePermission('discounts:update')
  async updateDiscount(
    @Param('id', UuidPipe) id: string,
    @Body(new ZodPipe(updateDiscountSchema)) data: UpdateDiscount,
  ) {
    return this.discountsService.updateDiscount(id, data)
  }

  /** PUT /api/discounts/:id/toggle — activar/desactivar */
  @Put(':id/toggle')
  @RequirePermission('discounts:update')
  async toggleDiscount(@Param('id', UuidPipe) id: string) {
    return this.discountsService.toggleDiscount(id)
  }

  /** GET /api/discounts/applied?studentId=&academicYear= */
  @Get('applied')
  @RequirePermission('discounts:list')
  async listApplied(
    @Query(new ZodPipe(listAppliedQuerySchema)) query: { studentId: string; academicYear: number },
  ) {
    return this.discountsService.listAppliedByStudent(query.studentId, query.academicYear)
  }

  /** POST /api/discounts/applied — asignar descuento manual a alumno */
  @Post('applied')
  @RequirePermission('discounts:create')
  async applyDiscount(
    @Body(new ZodPipe(createAppliedDiscountSchema)) data: CreateAppliedDiscount,
    @CurrentSession() session: Session,
  ) {
    return this.discountsService.applyDiscount(data, session)
  }

  /** DELETE /api/discounts/applied/:id */
  @Delete('applied/:id')
  @RequirePermission('discounts:delete')
  async removeApplied(@Param('id', UuidPipe) id: string) {
    await this.discountsService.removeAppliedDiscount(id)
  }
}
