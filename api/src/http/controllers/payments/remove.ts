import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeDeletePaymentUseCase } from '../../../use-cases/payment/factories/make-delete-payment-use-case'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deletePaymentParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = deletePaymentParamsSchema.parse(request.params)

  const deletePaymentUseCase = makeDeletePaymentUseCase()

  await deletePaymentUseCase.execute({
    payment_id: id,
    user_id: request.user.sub,
  })

  return reply.status(204).send()
}
