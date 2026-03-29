import { z } from 'zod';

export const updateFeePriceSchema = z.object({
  priceTierId: z.string().uuid().optional(),
  academicYear: z.number().int().min(2020).max(2099),
  amount: z.number().positive(),
});

export type UpdateFeePrice = z.infer<typeof updateFeePriceSchema>;
