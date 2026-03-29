import { z } from 'zod';

export const createFeePriceSchema = z.object({
  feeConceptId: z.string().uuid(),
  priceTierId: z.string().uuid().optional(),
  academicYear: z.number().int().min(2020).max(2099),
  amount: z.number().positive(),
});

export type CreateFeePrice = z.infer<typeof createFeePriceSchema>;
