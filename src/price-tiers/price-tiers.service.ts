import { EntityManager } from '@mikro-orm/postgresql';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { PriceTier } from './entities/price-tier.entity';
import { PriceTiersRepository } from './price-tiers.repository';

const SEED_TIERS = [
  { code: 'jardin', name: 'Jardín', displayOrder: 1 },
  { code: 'primaria_1', name: 'Primaria 1er ciclo', displayOrder: 2 },
  { code: 'primaria_2', name: 'Primaria 2do ciclo', displayOrder: 3 },
  { code: 'secundaria', name: 'Secundaria', displayOrder: 4 },
] as const;

@Injectable()
export class PriceTiersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly priceTiersRepository: PriceTiersRepository,
    private readonly em: EntityManager,
  ) {}

  async listPriceTiers() {
    return this.priceTiersRepository.findAll();
  }

  async onApplicationBootstrap() {
    const em = this.em.fork();
    const count = await em.count(PriceTier, {});
    if (count > 0) return;

    this.logger.log('Seeding price tiers...');
    for (const tier of SEED_TIERS) {
      em.persist(new PriceTier(tier));
    }
    await em.flush();
  }
}
