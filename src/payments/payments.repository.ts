import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Payment } from './entities/payment.entity'
import { Receipt } from './entities/receipt.entity'

@Injectable()
export class PaymentsRepository {
  constructor(private readonly em: EntityManager) {}

  async findByFamily(familyId: string) {
    return this.em.findAll(Payment, {
      where: { family: { id: familyId } },
      populate: ['receipt', 'installment', 'receivedBy'],
      orderBy: { paymentDate: 'DESC', createdAt: 'DESC' },
    })
  }

  async findOneById(id: string) {
    return this.em.findOne(Payment, { id }, { populate: ['receipt', 'installment', 'receivedBy', 'family'] })
  }

  async getNextReceiptNumber(academicYear: number): Promise<number> {
    const last = await this.em.findOne(
      Receipt,
      { academicYear },
      { orderBy: { receiptNumber: 'DESC' } },
    )
    return last ? last.receiptNumber + 1 : 1
  }
}
