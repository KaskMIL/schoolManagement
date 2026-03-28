import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Institution } from './entities/institution.entity';

@Injectable()
export class InstitutionsRepository {
  constructor(private readonly em: EntityManager) {}

  async findAll() {
    return this.em.findAll(Institution, { orderBy: { name: 'ASC' } });
  }

  async findOneById(id: string) {
    return this.em.findOne(Institution, { id });
  }
}
