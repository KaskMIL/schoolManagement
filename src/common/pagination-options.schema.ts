import { z } from 'zod';

export type PaginationOptions = z.infer<typeof paginationOptionsSchema>;
export const paginationOptionsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().positive().catch(20),
});
