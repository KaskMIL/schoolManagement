import { z } from 'zod'

export const updateSystemConfigSchema = z.object({
  currentAcademicYear: z.number().int().min(2020).max(2099),
})

export type UpdateSystemConfig = z.infer<typeof updateSystemConfigSchema>
