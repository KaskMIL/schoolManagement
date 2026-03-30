import { z } from 'zod'

export const updateSystemConfigSchema = z.object({
  currentAcademicYear: z.number().int().min(2020).max(2099),
  /** Día del mes hasta el cual aplica el descuento por pronto pago (1-28) */
  earlyPaymentCutoffDay: z.number().int().min(1).max(28).optional(),
})

export type UpdateSystemConfig = z.infer<typeof updateSystemConfigSchema>
