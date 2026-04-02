import { PaginationOptions } from '@/common/pagination-options.schema';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FamilyStatus } from './entities/family-status.enum';
import { Family } from './entities/family.entity';
import { Guardian } from './entities/guardian.entity';
import { FamiliesRepository } from './families.repository';
import { CreateFamily } from './schemas/create-family.schema';
import { CreateGuardian } from './schemas/create-guardian.schema';
import { UpdateFamily } from './schemas/update-family.schema';
import { UpdateGuardian } from './schemas/update-guardian.schema';
import { wrap } from '@mikro-orm/core';

@Injectable()
export class FamiliesService {
  constructor(
    private readonly familiesRepository: FamiliesRepository,
    private readonly em: EntityManager,
  ) {}

  async createFamily(data: CreateFamily) {
    const { guardians: guardiansData, ...familyData } = data;
    const family = new Family(familyData);

    if (guardiansData && guardiansData.length > 0) {
      for (const guardianData of guardiansData) {
        const guardian = new Guardian({ ...guardianData, family: wrap(family).toReference() });
        family.guardians.add(guardian);
      }
    }

    await this.em.persist(family).flush();
    return family;
  }

  async listFamilies(opts: PaginationOptions, status?: FamilyStatus, search?: string) {
    return this.familiesRepository.findAll(opts, status, search);
  }

  async getFamily(familyId: string) {
    const family = await this.familiesRepository.findOneById(familyId);
    if (family === null) throw new NotFoundException();
    return family;
  }

  async updateFamily(familyId: string, data: UpdateFamily) {
    const family = await this.familiesRepository.findOneById(familyId);
    if (family === null) throw new NotFoundException();
    family.update(data);
    await this.em.flush();
    return family;
  }

  async deactivateFamily(familyId: string) {
    const family = await this.familiesRepository.findOneById(familyId);
    if (family === null) throw new NotFoundException();
    if (!family.isActive()) throw new ConflictException('La familia ya está inactiva');
    family.deactivate();
    await this.em.flush();
  }

  async reactivateFamily(familyId: string) {
    const family = await this.familiesRepository.findOneById(familyId);
    if (family === null) throw new NotFoundException();
    if (family.isActive()) throw new ConflictException('La familia ya está activa');
    family.reactivate();
    await this.em.flush();
  }

  async createGuardian(familyId: string, data: CreateGuardian) {
    const family = await this.familiesRepository.findOneById(familyId);
    if (family === null) throw new NotFoundException();
    const guardian = new Guardian({ ...data, family: wrap(family).toReference() });
    await this.em.persist(guardian).flush();
    return guardian;
  }

  async updateGuardian(familyId: string, guardianId: string, data: UpdateGuardian) {
    const guardian = await this.familiesRepository.findGuardian(familyId, guardianId);
    if (guardian === null) throw new NotFoundException();
    guardian.update(data);
    await this.em.flush();
    return guardian;
  }

  async deleteGuardian(familyId: string, guardianId: string) {
    const guardian = await this.familiesRepository.findGuardian(familyId, guardianId);
    if (guardian === null) throw new NotFoundException();
    await this.em.remove(guardian).flush();
  }
}
