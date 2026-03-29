import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Installment } from './entities/installment.entity'

@Injectable()
export class InstallmentsRepository {
  constructor(private readonly em: EntityManager) {}

  async findByFamily(familyId: string) {
    return this.em.findAll(Installment, {
      where: { family: { id: familyId } },
      populate: ['details', 'details.feeConcept', 'details.student'],
      orderBy: { academicYear: 'DESC', month: 'DESC' },
    })
  }

  async findOneById(id: string) {
    return this.em.findOne(Installment, { id }, { populate: ['details', 'details.feeConcept', 'details.student'] })
  }

  async findOneByFamilyMonthYear(familyId: string, month: number, academicYear: number) {
    return this.em.findOne(Installment, {
      family: { id: familyId },
      month,
      academicYear,
    })
  }
}
