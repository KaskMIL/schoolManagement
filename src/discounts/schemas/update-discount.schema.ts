import { z } from 'zod'

export const updateDiscountSchema = z.object({
  name: z.string().min(1).optional(),
  percentage: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Porcentaje inválido').optional(),
})

export type UpdateDiscount = z.infer<typeof updateDiscountSchema>
