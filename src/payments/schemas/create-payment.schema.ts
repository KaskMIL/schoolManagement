import { z } from 'zod'
import { PaymentMethod } from '../entities/payment-method.enum'

export const createPaymentSchema = z.object({
  familyId: z.string().uuid(),
  installmentId: z.string().uuid().optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido'),
  paymentDate: z.string().date(),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().min(1).optional(),
  notes: z.string().optional(),
})

export type CreatePayment = z.infer<typeof createPaymentSchema>
