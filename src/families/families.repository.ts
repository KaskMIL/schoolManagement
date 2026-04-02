import { PaginationOptions } from '@/common/pagination-options.schema';
import { EntityManager, FilterQuery } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { FamilyStatus } from './entities/family-status.enum';
import { Family } from './entities/family.entity';
import { Guardian } from './entities/guardian.entity';

@Injectable()
export class FamiliesRepository {
  constructor(private readonly em: EntityManager) {}

  async findAll(opts: PaginationOptions, status?: FamilyStatus, search?: string) {
    const where: FilterQuery<Family> = {};
    if (status) where.status = status;
    if (search) where.familyName = { $ilike: `%${search}%` };

    const [items, total] = await this.em.findAndCount(Family, where, {
      offset: (opts.page - 1) * opts.limit,
      limit: opts.limit,
      orderBy: { familyName: 'ASC' },
    });
    return { total, items };
  }

  async findOneById(id: string) {
    return this.em.findOne(Family, { id }, { populate: ['guardians'] });
  }

  async findGuardian(familyId: string, guardianId: string) {
    return this.em.findOne(Guardian, { id: guardianId, family: { id: familyId } });
  }
}
