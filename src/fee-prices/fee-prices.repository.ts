import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { FeePrice } from './entities/fee-price.entity';

@Injectable()
export class FeePricesRepository {
  constructor(private readonly em: EntityManager) {}

  async findByConceptAndYear(feeConceptId: string, academicYear: number) {
    return this.em.findAll(FeePrice, {
      where: { feeConcept: { id: feeConceptId }, academicYear },
      populate: ['priceTier'],
      orderBy: { priceTier: { displayOrder: 'ASC NULLS LAST' } },
    });
  }

  async findOneById(id: string) {
    return this.em.findOne(FeePrice, { id });
  }
}
