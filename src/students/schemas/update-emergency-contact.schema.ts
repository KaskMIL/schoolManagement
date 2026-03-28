import { z } from 'zod';

export const updateEmergencyContactSchema = z.object({
  name: z.string().trim().min(1).max(150),
  phone: z.string().trim().min(1).max(30),
  relationship: z.string().trim().min(1).max(50),
  priorityOrder: z.number().int().min(1).optional(),
});

export type UpdateEmergencyContact = z.infer<typeof updateEmergencyContactSchema>;
