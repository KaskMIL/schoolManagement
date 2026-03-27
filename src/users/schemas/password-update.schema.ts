import { z } from 'zod';
import { newUserSchema } from './new-user.schema';

export type PasswordUpdate = z.infer<typeof passwordUpdateSchema>;
export const passwordUpdateSchema = newUserSchema.pick({ password: true });
