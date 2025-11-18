import type { FastifyReply, FastifyRequest } from 'fastify'
import { makeFetchUserPaymentsUseCase } from '../../../use-cases/payment/factories/make-fetch-user-payments-use-case'

export async function fetch(request: FastifyRequest, reply: FastifyReply) {
  const fetchUserPaymentsUseCase = makeFetchUserPaymentsUseCase()

  const { payments } = await fetchUserPaymentsUseCase.execute({
    user_id: request.user.sub,
  })

  return reply.status(200).send({ payments })
}
