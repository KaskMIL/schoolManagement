import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable, Logger, NotFoundException, OnApplicationBootstrap } from '@nestjs/common'
import { SystemConfig } from './entities/system-config.entity'
import { SystemConfigRepository } from './system-config.repository'
import { UpdateSystemConfig } from './schemas/update-system-config.schema'

export const CONFIG_KEYS = {
  CURRENT_ACADEMIC_YEAR: 'current_academic_year',
} as const

@Injectable()
export class SystemConfigService implements OnApplicationBootstrap {
  private readonly logger = new Logger(this.constructor.name)

  constructor(
    private readonly systemConfigRepository: SystemConfigRepository,
    private readonly em: EntityManager,
  ) {}

  async getConfig() {
    const entries = await this.systemConfigRepository.findAll()
    return this.toDto(entries)
  }

  async getCurrentAcademicYear(): Promise<number> {
    const entry = await this.systemConfigRepository.findByKey(CONFIG_KEYS.CURRENT_ACADEMIC_YEAR)
    if (!entry) return new Date().getFullYear()
    return parseInt(entry.value, 10)
  }

  async updateConfig(data: UpdateSystemConfig) {
    const em = this.em.fork()

    const yearEntry = await em.findOne(SystemConfig, { key: CONFIG_KEYS.CURRENT_ACADEMIC_YEAR })
    if (!yearEntry) throw new NotFoundException('Configuración no encontrada')

    yearEntry.value = String(data.currentAcademicYear)
    await em.flush()

    const entries = await em.findAll(SystemConfig, {})
    return this.toDto(entries)
  }

  async onApplicationBootstrap() {
    const em = this.em.fork()
    const existing = await em.findOne(SystemConfig, { key: CONFIG_KEYS.CURRENT_ACADEMIC_YEAR })
    if (existing) return

    this.logger.log('Seeding system config...')
    const currentYear = new Date().getFullYear()
    em.persist(new SystemConfig(CONFIG_KEYS.CURRENT_ACADEMIC_YEAR, String(currentYear)))
    await em.flush()
  }

  private toDto(entries: SystemConfig[]) {
    const map = Object.fromEntries(entries.map((e) => [e.key, e.value]))
    return {
      currentAcademicYear: parseInt(map[CONFIG_KEYS.CURRENT_ACADEMIC_YEAR] ?? String(new Date().getFullYear()), 10),
    }
  }
}
