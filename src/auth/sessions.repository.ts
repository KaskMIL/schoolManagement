import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(private readonly em: EntityManager) {}

  async findOneById(id: string) {
    return this.em.findOne(Session, { id });
  }
}
