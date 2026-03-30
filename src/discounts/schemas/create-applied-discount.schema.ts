import { z } from 'zod'

export const createAppliedDiscountSchema = z.object({
  studentId: z.string().uuid(),
  discountId: z.string().uuid(),
  academicYear: z.number().int().min(2020).max(2099),
  /** Si no se envía, se usa el porcentaje default del Discount */
  percentage: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Porcentaje inválido').optional(),
  validFrom: z.string().date().optional(),
  validTo: z.string().date().optional(),
  notes: z.string().optional(),
})

export type CreateAppliedDiscount = z.infer<typeof createAppliedDiscountSchema>
