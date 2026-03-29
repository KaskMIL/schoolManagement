import { z } from 'zod';

export const updateStudentServiceSchema = z.object({
  academicYear: z.number().int().min(2020).max(2099),
  activeFrom: z.string().date().transform((v) => new Date(v)),
  activeTo: z.string().date().transform((v) => new Date(v)).optional(),
  notes: z.string().trim().min(1).optional(),
});

export type UpdateStudentService = z.infer<typeof updateStudentServiceSchema>;
