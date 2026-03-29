import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { SystemConfig } from './entities/system-config.entity'

@Injectable()
export class SystemConfigRepository {
  constructor(private readonly em: EntityManager) {}

  async findByKey(key: string) {
    return this.em.findOne(SystemConfig, { key })
  }

  async findAll() {
    return this.em.findAll(SystemConfig, {})
  }
}
