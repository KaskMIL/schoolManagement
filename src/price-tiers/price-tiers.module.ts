import { Module } from '@nestjs/common';
import { PriceTiersController } from './price-tiers.controller';
import { PriceTiersRepository } from './price-tiers.repository';
import { PriceTiersService } from './price-tiers.service';

@Module({
  controllers: [PriceTiersController],
  providers: [PriceTiersRepository, PriceTiersService],
  exports: [PriceTiersRepository],
})
export class PriceTiersModule {}
