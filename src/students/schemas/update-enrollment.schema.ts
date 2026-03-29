import { z } from 'zod';
import { EnrollmentStatus } from '../entities/enrollment-status.enum';
import { Level } from '../entities/level.enum';
import { Section } from '../entities/section.enum';
import { Shift } from '../entities/shift.enum';

export const updateEnrollmentSchema = z.object({
  academicYear: z.number().int().min(2020).max(2099),
  level: z.enum(Level),
  grade: z.number().int().min(1).max(6),
  section: z.enum(Section),
  shift: z.enum(Shift),
  status: z.enum(EnrollmentStatus).optional(),
  enrollmentDate: z.string().date().transform((v) => new Date(v)).optional(),
  notes: z.string().trim().min(1).optional(),
});

export type UpdateEnrollment = z.infer<typeof updateEnrollmentSchema>;
