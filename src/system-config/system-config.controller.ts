import { RequirePermission } from '@/auth/decorators/require-permission.decorator'
import { ZodPipe } from '@/common/zod.pipe'
import { Body, Controller, Get, Patch } from '@nestjs/common'
import { UpdateSystemConfig, updateSystemConfigSchema } from './schemas/update-system-config.schema'
import { SystemConfigService } from './system-config.service'

@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get()
  @RequirePermission('system-config:read')
  async getConfig() {
    return this.systemConfigService.getConfig()
  }

  @Patch()
  @RequirePermission('system-config:update')
  async updateConfig(@Body(new ZodPipe(updateSystemConfigSchema)) data: UpdateSystemConfig) {
    return this.systemConfigService.updateConfig(data)
  }
}
