import { ForbiddenError } from '@/use-cases/errors/forbidden-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeDeleteSubscriptionUseCase } from '@/use-cases/subscription/factories/make-delete-subscription-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteSubscriptionParamsSchema = z.object({
    id: z.string().uuid('ID inválido'),
  })

  const { id } = deleteSubscriptionParamsSchema.parse(request.params)
  const userId = request.user.sub

  try {
    const deleteSubscriptionUseCase = makeDeleteSubscriptionUseCase()
    await deleteSubscriptionUseCase.execute({
      subscriptionId: id,
      userId,
    })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    if (error instanceof ForbiddenError) {
      return reply.status(403).send({ message: error.message })
    }

    throw error
  }
}
