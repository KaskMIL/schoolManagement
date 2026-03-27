import { z } from 'zod';
import { newUserSchema } from './new-user.schema';

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export const profileUpdateSchema = newUserSchema.pick({
  username: true,
  role: true,
});
