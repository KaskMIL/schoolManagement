import { z } from 'zod';
import { Relationship } from '../entities/relationship.enum';

export const updateGuardianSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  relationship: z.enum(Relationship),
  dni: z.string().trim().min(1).max(20).optional(),
  cuitCuil: z.string().trim().min(1).max(20).optional(),
  phone: z.string().trim().min(1).max(30).optional(),
  email: z.string().trim().email().optional(),
  isPrimaryContact: z.boolean().optional(),
  occupation: z.string().trim().min(1).max(100).optional(),
  employer: z.string().trim().min(1).max(100).optional(),
  notes: z.string().trim().min(1).optional(),
});

export type UpdateGuardian = z.infer<typeof updateGuardianSchema>;
