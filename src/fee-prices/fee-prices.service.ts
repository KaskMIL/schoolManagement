import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FeeConceptsRepository } from '../fee-concepts/fee-concepts.repository';
import { PriceTier } from '../price-tiers/entities/price-tier.entity';
import { PriceTiersRepository } from '../price-tiers/price-tiers.repository';
import { FeePrice } from './entities/fee-price.entity';
import { FeePricesRepository } from './fee-prices.repository';
import { CreateFeePrice } from './schemas/create-fee-price.schema';
import { UpdateFeePrice } from './schemas/update-fee-price.schema';

@Injectable()
export class FeePricesService {
  constructor(
    private readonly feePricesRepository: FeePricesRepository,
    private readonly feeConceptsRepository: FeeConceptsRepository,
    private readonly priceTiersRepository: PriceTiersRepository,
    private readonly em: EntityManager,
  ) {}

  async listFeePrices(feeConceptId: string, academicYear: number) {
    return this.feePricesRepository.findByConceptAndYear(feeConceptId, academicYear);
  }

  async createFeePrice(data: CreateFeePrice) {
    const concept = await this.feeConceptsRepository.findOneById(data.feeConceptId);
    if (!concept) throw new NotFoundException('Concepto no encontrado');

    const priceTierRef = await this.resolvePriceTier(data.priceTierId);

    const price = new FeePrice({
      feeConcept: wrap(concept).toReference(),
      priceTier: priceTierRef,
      academicYear: data.academicYear,
      amount: String(data.amount),
    });
    await this.em.persist(price).flush();
    return price;
  }

  async updateFeePrice(priceId: string, data: UpdateFeePrice) {
    const price = await this.feePricesRepository.findOneById(priceId);
    if (!price) throw new NotFoundException();

    const priceTierRef = await this.resolvePriceTier(data.priceTierId);

    price.update({
      priceTier: priceTierRef,
      academicYear: data.academicYear,
      amount: String(data.amount),
    });
    await this.em.flush();
    return price;
  }

  async deleteFeePrice(priceId: string) {
    const price = await this.feePricesRepository.findOneById(priceId);
    if (!price) throw new NotFoundException();
    await this.em.remove(price).flush();
  }

  private async resolvePriceTier(priceTierId?: string) {
    if (!priceTierId) return undefined;
    const tier = await this.em.findOne(PriceTier, { id: priceTierId });
    if (!tier) throw new NotFoundException('Ciclo de precios no encontrado');
    return wrap(tier).toReference();
  }
}
