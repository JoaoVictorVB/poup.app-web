import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCreatePaymentUseCase } from '../../../use-cases/payment/factories/make-create-payment-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createPaymentBodySchema = z.object({
    amount: z.number().positive(),
    payment_date: z.coerce.date().optional(),
    payment_method: z.enum(['credit_card', 'debit_card', 'pix', 'cash', 'bank_transfer']),
    status: z.enum(['paid', 'pending', 'cancelled']).optional(),
    notes: z.string().optional(),
    subscription_id: z.string().uuid().optional(),
    product_id: z.string().uuid().optional(),
  })

  const { amount, payment_date, payment_method, status, notes, subscription_id, product_id } =
    createPaymentBodySchema.parse(request.body)

  const createPaymentUseCase = makeCreatePaymentUseCase()

  const { payment } = await createPaymentUseCase.execute({
    amount,
    payment_date,
    payment_method,
    status,
    notes,
    user_id: request.user.sub,
    subscription_id,
    product_id,
  })

  return reply.status(201).send({ payment })
}
