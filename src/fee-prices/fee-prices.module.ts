import { Module } from '@nestjs/common';
import { FeeConceptsModule } from '../fee-concepts/fee-concepts.module';
import { PriceTiersModule } from '../price-tiers/price-tiers.module';
import { FeePricesController } from './fee-prices.controller';
import { FeePricesRepository } from './fee-prices.repository';
import { FeePricesService } from './fee-prices.service';

@Module({
  imports: [FeeConceptsModule, PriceTiersModule],
  controllers: [FeePricesController],
  providers: [FeePricesRepository, FeePricesService],
})
export class FeePricesModule {}
