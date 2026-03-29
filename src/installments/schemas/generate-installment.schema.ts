import { z } from 'zod'

export const generateInstallmentSchema = z.object({
  familyId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  /** Si no se envía, se usa el año lectivo activo de system-config */
  academicYear: z.number().int().min(2020).max(2099).optional(),
  dueDate: z.string().date(),
  notes: z.string().optional(),
})

export type GenerateInstallment = z.infer<typeof generateInstallmentSchema>
