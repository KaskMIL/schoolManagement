import { z } from 'zod'
import { PaymentMethod } from '../entities/payment-method.enum'

const allocationSchema = z.object({
  installmentId: z.string().uuid(),
  allocatedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido'),
})

export const createPaymentSchema = z.object({
  familyId: z.string().uuid(),
  /** Asignaciones a cuotas específicas. Vacío = pago a cuenta (saldo a favor) */
  allocations: z.array(allocationSchema).optional().default([]),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido'),
  paymentDate: z.string().date(),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().min(1).optional(),
  notes: z.string().optional(),
})

export type CreatePayment = z.infer<typeof createPaymentSchema>
