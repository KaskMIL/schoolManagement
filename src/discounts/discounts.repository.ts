import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { AppliedDiscount } from './entities/applied-discount.entity'
import { Discount } from './entities/discount.entity'
import { DiscountType } from './entities/discount-type.enum'

@Injectable()
export class DiscountsRepository {
  constructor(private readonly em: EntityManager) {}

  async findAll() {
    return this.em.findAll(Discount, { orderBy: { type: 'ASC' } })
  }

  async findOneById(id: string) {
    return this.em.findOne(Discount, { id })
  }

  async findByType(type: DiscountType) {
    return this.em.findOne(Discount, { type })
  }

  async findAppliedByStudent(studentId: string, academicYear: number) {
    return this.em.findAll(AppliedDiscount, {
      where: { student: { id: studentId }, academicYear },
      populate: ['discount', 'approvedBy'],
    })
  }

  async findAppliedById(id: string) {
    return this.em.findOne(
      AppliedDiscount,
      { id },
      { populate: ['discount', 'student', 'approvedBy'] },
    )
  }
}
