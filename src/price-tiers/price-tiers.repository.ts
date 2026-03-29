import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { PriceTier } from './entities/price-tier.entity';

@Injectable()
export class PriceTiersRepository {
  constructor(private readonly em: EntityManager) {}

  async findAll() {
    return this.em.findAll(PriceTier, { orderBy: { displayOrder: 'ASC' } });
  }

  async findByCode(code: string) {
    return this.em.findOne(PriceTier, { code });
  }
}
