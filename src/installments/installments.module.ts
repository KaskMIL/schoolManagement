import { Module } from '@nestjs/common'
import { FamiliesModule } from '../families/families.module'
import { SystemConfigModule } from '../system-config/system-config.module'
import { InstallmentsController } from './installments.controller'
import { InstallmentsRepository } from './installments.repository'
import { InstallmentsService } from './installments.service'

@Module({
  imports: [FamiliesModule, SystemConfigModule],
  controllers: [InstallmentsController],
  providers: [InstallmentsRepository, InstallmentsService],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}
