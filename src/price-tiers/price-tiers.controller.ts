import { SkipAuthorization } from '@/auth/decorators/skip-authorization.decorator';
import { Controller, Get } from '@nestjs/common';
import { PriceTiersService } from './price-tiers.service';

@Controller('price-tiers')
export class PriceTiersController {
  constructor(private readonly priceTiersService: PriceTiersService) {}

  @Get()
  @SkipAuthorization()
  async listPriceTiers() {
    return this.priceTiersService.listPriceTiers();
  }
}
