import { z } from 'zod';

export const createStudentServiceSchema = z.object({
  feeConceptId: z.string().uuid(),
  academicYear: z.number().int().min(2020).max(2099),
  activeFrom: z.string().date().transform((v) => new Date(v)),
  activeTo: z.string().date().transform((v) => new Date(v)).optional(),
  notes: z.string().trim().min(1).optional(),
});

export type CreateStudentService = z.infer<typeof createStudentServiceSchema>;
