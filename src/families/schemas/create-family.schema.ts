import { z } from 'zod';
import { Relationship } from '../entities/relationship.enum';

const createGuardianInlineSchema = z.object({
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

export const createFamilySchema = z.object({
  familyName: z.string().trim().min(1).max(150),
  primaryEmail: z.string().trim().email().optional(),
  primaryPhone: z.string().trim().min(1).max(30).optional(),
  address: z.string().trim().min(1).optional(),
  locality: z.string().trim().min(1).max(100).optional(),
  notes: z.string().trim().min(1).optional(),
  guardians: z.array(createGuardianInlineSchema).optional(),
});

export type CreateFamily = z.infer<typeof createFamilySchema>;
