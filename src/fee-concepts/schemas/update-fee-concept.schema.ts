import { z } from 'zod';
import { FeeConceptType } from '../entities/fee-concept-type.enum';

export const updateFeeConceptSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.enum(FeeConceptType),
  isRecurring: z.boolean(),
  description: z.string().trim().min(1).optional(),
});

export type UpdateFeeConcept = z.infer<typeof updateFeeConceptSchema>;
