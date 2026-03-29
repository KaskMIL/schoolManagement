import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { FeeConcept } from './entities/fee-concept.entity';

@Injectable()
export class FeeConceptsRepository {
  constructor(private readonly em: EntityManager) {}

  async findAll(institutionId: string) {
    return this.em.findAll(FeeConcept, {
      where: { institution: { id: institutionId } },
      orderBy: { name: 'ASC' },
    });
  }

  async findOneById(id: string) {
    return this.em.findOne(FeeConcept, { id });
  }
}
