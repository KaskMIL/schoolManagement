import { EntityManager } from '@mikro-orm/postgresql';
import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Institution } from './entities/institution.entity';
import { InstitutionsRepository } from './institutions.repository';
import { UpdateInstitution } from './schemas/update-institution.schema';

@Injectable()
export class InstitutionsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly em: EntityManager,
  ) {}

  async listInstitutions() {
    return this.institutionsRepository.findAll();
  }

  async updateInstitution(institutionId: string, data: UpdateInstitution) {
    const institution = await this.institutionsRepository.findOneById(institutionId);
    if (!institution) throw new NotFoundException();
    institution.update(data);
    await this.em.flush();
    return institution;
  }

  async onApplicationBootstrap() {
    const em = this.em.fork();
    const count = await em.count(Institution, {});
    if (count > 0) return;

    this.logger.log('Seeding institutions...');
    const institutions = [
      new Institution({ name: 'Jardín de Infantes La Alpina Verde' }),
      new Institution({ name: 'Colegio San Miguel Arcángel' }),
    ];
    await em.persist(institutions).flush();
  }
}
