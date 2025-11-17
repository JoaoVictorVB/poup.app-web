import { ForbiddenError } from '@/use-cases/errors/forbidden-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { ValidationError } from '@/use-cases/errors/validation-error'
import { makeCreateSubscriptionUseCase } from '@/use-cases/subscription/factories/make-create-subscription-use-case'
import { makeDeleteSubscriptionUseCase } from '@/use-cases/subscription/factories/make-delete-subscription-use-case'
import { makeFetchUserSubscriptionsUseCase } from '@/use-cases/subscription/factories/make-fetch-user-subscriptions-use-case'
import { makeUpdateSubscriptionUseCase } from '@/use-cases/subscription/factories/make-update-subscription-use-case'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function subscriptionRoutes(app: FastifyInstance) {
  app.get('/subscriptions', {
    preHandler: [app.authenticate],
  }, async (request) => {
    const userId = request.user.sub

    const fetchUserSubscriptionsUseCase = makeFetchUserSubscriptionsUseCase()
    const { subscriptions } = await fetchUserSubscriptionsUseCase.execute({ userId })

    return { subscriptions }
  })

  app.post('/subscriptions', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const createSubscriptionSchema = z.object({
      name: z.string().min(1, 'Nome é obrigatório'),
      price: z.number().positive('Preço deve ser maior que zero'),
      billing_cycle: z.enum(['monthly', 'yearly'], {
        errorMap: () => ({ message: 'Ciclo deve ser "monthly" ou "yearly"' }),
      }),
      next_payment: z.string().datetime('Data inválida'),
    })

    const { name, price, billing_cycle, next_payment } = createSubscriptionSchema.parse(request.body)
    const userId = request.user.sub

    try {
      const createSubscriptionUseCase = makeCreateSubscriptionUseCase()
      const { subscription } = await createSubscriptionUseCase.execute({
        name,
        price,
        billing_cycle,
        next_payment: new Date(next_payment),
        user_id: userId,
      })

      return reply.status(201).send({ subscription })
    } catch (error) {
      if (error instanceof ValidationError) {
        return reply.status(400).send({ message: error.message })
      }

      throw error
    }
  })

  app.put('/subscriptions/:id', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid('ID inválido'),
    })

    const { id } = paramsSchema.parse(request.params)

    const updateSubscriptionSchema = z.object({
      name: z.string().min(1, 'Nome não pode ser vazio').optional(),
      price: z.number().positive('Preço deve ser maior que zero').optional(),
      billing_cycle: z.enum(['monthly', 'yearly'], {
        errorMap: () => ({ message: 'Ciclo deve ser "monthly" ou "yearly"' }),
      }).optional(),
      next_payment: z.string().datetime('Data inválida').optional(),
    })

    const data = updateSubscriptionSchema.parse(request.body)
    const userId = request.user.sub

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

      return { subscription }
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
  })

  app.delete('/subscriptions/:id', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid('ID inválido'),
    })

    const { id } = paramsSchema.parse(request.params)
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
  })
}