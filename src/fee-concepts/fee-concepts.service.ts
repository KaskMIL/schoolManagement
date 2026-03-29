import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InstitutionsRepository } from '../institutions/institutions.repository';
import { FeeConcept } from './entities/fee-concept.entity';
import { FeeConceptsRepository } from './fee-concepts.repository';
import { CreateFeeConcept } from './schemas/create-fee-concept.schema';
import { UpdateFeeConcept } from './schemas/update-fee-concept.schema';

@Injectable()
export class FeeConceptsService {
  constructor(
    private readonly feeConceptsRepository: FeeConceptsRepository,
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly em: EntityManager,
  ) {}

  async listFeeConcepts(institutionId: string) {
    return this.feeConceptsRepository.findAll(institutionId);
  }

  async createFeeConcept(data: CreateFeeConcept) {
    const institution = await this.institutionsRepository.findOneById(data.institutionId);
    if (!institution) throw new NotFoundException('Institución no encontrada');

    const concept = new FeeConcept({
      institution: wrap(institution).toReference(),
      name: data.name,
      type: data.type,
      isRecurring: data.isRecurring,
      description: data.description,
    });
    await this.em.persist(concept).flush();
    return concept;
  }

  async updateFeeConcept(conceptId: string, data: UpdateFeeConcept) {
    const concept = await this.feeConceptsRepository.findOneById(conceptId);
    if (!concept) throw new NotFoundException();
    concept.update(data);
    await this.em.flush();
    return concept;
  }

  async toggleFeeConcept(conceptId: string, active: boolean) {
    const concept = await this.feeConceptsRepository.findOneById(conceptId);
    if (!concept) throw new NotFoundException();
    if (active) { concept.activate() } else { concept.deactivate() }
    await this.em.flush();
  }
}
