import { z } from 'zod';
import { FeeConceptType } from '../entities/fee-concept-type.enum';

export const createFeeConceptSchema = z.object({
  institutionId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  type: z.enum(FeeConceptType),
  isRecurring: z.boolean(),
  description: z.string().trim().min(1).optional(),
});

export type CreateFeeConcept = z.infer<typeof createFeeConceptSchema>;
