import { z } from 'zod';
import { MAX_PASSWORD_LENGTH } from '../constants';
import { Role } from '../entities/role.enum';

export type NewUser = z.infer<typeof newUserSchema>;
export const newUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[a-z0-9._-]*$/),
  password: z.string().min(8).max(MAX_PASSWORD_LENGTH),
  role: z.enum(Role),
});
