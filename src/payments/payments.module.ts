import { Module } from '@nestjs/common'
import { FamiliesModule } from '../families/families.module'
import { SystemConfigModule } from '../system-config/system-config.module'
import { PaymentsController } from './payments.controller'
import { PaymentsRepository } from './payments.repository'
import { PaymentsService } from './payments.service'

@Module({
  imports: [FamiliesModule, SystemConfigModule],
  controllers: [PaymentsController],
  providers: [PaymentsRepository, PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
