import { z } from 'zod';
import { Gender } from '../entities/gender.enum';
import { StudentStatus } from '../entities/student-status.enum';

const optionalDate = z
  .string()
  .date()
  .transform((v) => new Date(v))
  .optional();

export const updateStudentSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  status: z.enum(StudentStatus).optional(),
  dni: z.string().trim().min(1).max(20).optional(),
  birthDate: optionalDate,
  gender: z.enum(Gender).optional(),
  bloodType: z.string().trim().min(1).max(5).optional(),
  medicalNotes: z.string().trim().min(1).optional(),
  allergies: z.string().trim().min(1).optional(),
  healthInsurance: z.string().trim().min(1).max(100).optional(),
  healthInsuranceNumber: z.string().trim().min(1).max(50).optional(),
  enrollmentDate: optionalDate,
  notes: z.string().trim().min(1).optional(),
});

export type UpdateStudent = z.infer<typeof updateStudentSchema>;
