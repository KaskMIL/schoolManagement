import { PaginationOptions } from '@/common/pagination-options.schema';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(private readonly em: EntityManager) {}

  async findAll(opts: PaginationOptions) {
    const [items, total] = await this.em.findAndCount(
      User,
      { username: { $ne: 'root' } },
      {
        offset: (opts.page - 1) * opts.limit,
        limit: opts.limit,
        orderBy: { username: 'ASC' },
      },
    );
    return { total, items };
  }

  async findOneById(id: string) {
    return this.em.findOne(User, { id });
  }

  async findOneByUsername(username: string) {
    return this.em.findOne(User, { username });
  }
}
