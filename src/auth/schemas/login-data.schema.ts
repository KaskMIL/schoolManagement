import { z } from 'zod';

export type LoginData = z.infer<typeof loginDataSchema>;
export const loginDataSchema = z.object({
  username: z.string().trim(),
  password: z.string(),
});
