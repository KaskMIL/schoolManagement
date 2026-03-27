import { z } from 'zod';

export const updateFamilySchema = z.object({
  familyName: z.string().trim().min(1).max(150),
  primaryEmail: z.string().trim().email().optional(),
  primaryPhone: z.string().trim().min(1).max(30).optional(),
  address: z.string().trim().min(1).optional(),
  locality: z.string().trim().min(1).max(100).optional(),
  notes: z.string().trim().min(1).optional(),
});

export type UpdateFamily = z.infer<typeof updateFamilySchema>;
