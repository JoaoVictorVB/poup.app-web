import { ForbiddenError } from '@/use-cases/errors/forbidden-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { ValidationError } from '@/use-cases/errors/validation-error'
import { makeUpdateSubscriptionUseCase } from '@/use-cases/subscription/factories/make-update-subscription-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateSubscriptionParamsSchema = z.object({
    id: z.string().uuid('ID inválido'),
  })

  const updateSubscriptionBodySchema = z.object({
    name: z.string().min(1, 'Nome não pode ser vazio').optional(),
    price: z.number().positive('Preço deve ser maior que zero').optional(),
    billing_cycle: z
      .enum(['monthly', 'yearly'], {
        errorMap: () => ({ message: 'Ciclo deve ser "monthly" ou "yearly"' }),
      })
      .optional(),
    next_payment: z.string().datetime('Data inválida').optional(),
  })

  const { id } = updateSubscriptionParamsSchema.parse(request.params)
  const data = updateSubscriptionBodySchema.parse(request.body)
  const userId = (request.user as { id: string }).id

  try {
    const updateSubscriptionUseCase = makeUpdateSubscriptionUseCase()
    const { subscription } = await updateSubscriptionUseCase.execute({
      subscriptionId: id,
      userId,
      data: {
        ...data,
        next_payment: data.next_payment ? new Date(data.next_payment) : undefined,
      },
    })

    return reply.status(200).send({ subscription })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    if (error instanceof ForbiddenError) {
      return reply.status(403).send({ message: error.message })
    }
    if (error instanceof ValidationError) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}
