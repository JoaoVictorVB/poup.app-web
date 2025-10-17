import { makeFetchUserSubscriptionsUseCase } from '@/use-cases/subscription/factories/make-fetch-user-subscriptions-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function fetch(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as { id: string }).id

  const fetchUserSubscriptionsUseCase = makeFetchUserSubscriptionsUseCase()
  const { subscriptions } = await fetchUserSubscriptionsUseCase.execute({ userId })

  return reply.status(200).send({ subscriptions })
}
