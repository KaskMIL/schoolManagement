import { RequirePermission } from '@/auth/decorators/require-permission.decorator';
import { UuidPipe } from '@/common/uuid.pipe';
import { ZodPipe } from '@/common/zod.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import { FeePricesService } from './fee-prices.service';
import { CreateFeePrice, createFeePriceSchema } from './schemas/create-fee-price.schema';
import { UpdateFeePrice, updateFeePriceSchema } from './schemas/update-fee-price.schema';

const listQuerySchema = z.object({
  feeConceptId: z.string().uuid(),
  academicYear: z.coerce.number().int().min(2020).max(2099),
});

@Controller('fee-prices')
export class FeePricesController {
  constructor(private readonly feePricesService: FeePricesService) {}

  @Get()
  @RequirePermission('fee-prices:list')
  async listFeePrices(
    @Query(new ZodPipe(listQuerySchema)) query: { feeConceptId: string; academicYear: number },
  ) {
    return this.feePricesService.listFeePrices(query.feeConceptId, query.academicYear);
  }

  @Post()
  @RequirePermission('fee-prices:create')
  async createFeePrice(@Body(new ZodPipe(createFeePriceSchema)) data: CreateFeePrice) {
    return this.feePricesService.createFeePrice(data);
  }

  @Patch(':priceId')
  @RequirePermission('fee-prices:update')
  async updateFeePrice(
    @Param('priceId', UuidPipe) priceId: string,
    @Body(new ZodPipe(updateFeePriceSchema)) data: UpdateFeePrice,
  ) {
    return this.feePricesService.updateFeePrice(priceId, data);
  }

  @Delete(':priceId')
  @RequirePermission('fee-prices:delete')
  async deleteFeePrice(@Param('priceId', UuidPipe) priceId: string) {
    return this.feePricesService.deleteFeePrice(priceId);
  }
}
