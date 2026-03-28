import { z } from 'zod';

export const updateInstitutionSchema = z.object({
  name: z.string().trim().min(1).max(200),
  cue: z.string().trim().min(1).max(20).optional(),
  diegepDipregep: z.string().trim().min(1).max(20).optional(),
  address: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).max(30).optional(),
  email: z.string().trim().email().optional(),
  logoUrl: z.string().trim().url().optional(),
});

export type UpdateInstitution = z.infer<typeof updateInstitutionSchema>;
