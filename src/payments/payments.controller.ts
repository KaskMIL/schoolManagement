import { CurrentSession } from '@/auth/decorators/current-session.decorator'
import { RequirePermission } from '@/auth/decorators/require-permission.decorator'
import { Session } from '@/auth/entities/session.entity'
import { UuidPipe } from '@/common/uuid.pipe'
import { ZodPipe } from '@/common/zod.pipe'
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { z } from 'zod'
import { PaymentsService } from './payments.service'
import { CreatePayment, createPaymentSchema } from './schemas/create-payment.schema'

const listByFamilyQuerySchema = z.object({
  familyId: z.string().uuid(),
})

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @RequirePermission('payments:list')
  async listByFamily(
    @Query(new ZodPipe(listByFamilyQuerySchema)) query: { familyId: string },
  ) {
    return this.paymentsService.listByFamily(query.familyId)
  }

  @Get(':paymentId/receipt-data')
  @RequirePermission('payments:read')
  async getReceiptData(@Param('paymentId', UuidPipe) paymentId: string) {
    return this.paymentsService.getReceiptData(paymentId)
  }

  @Get(':paymentId')
  @RequirePermission('payments:read')
  async getPayment(@Param('paymentId', UuidPipe) paymentId: string) {
    return this.paymentsService.getPayment(paymentId)
  }

  @Post()
  @RequirePermission('payments:create')
  async createPayment(
    @Body(new ZodPipe(createPaymentSchema)) data: CreatePayment,
    @CurrentSession() session: Session,
  ) {
    return this.paymentsService.createPayment(data, session)
  }
}
