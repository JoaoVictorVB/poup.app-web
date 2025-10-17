import { ValidationError } from '@/use-cases/errors/validation-error'
import { makeCreateSubscriptionUseCase } from '@/use-cases/subscription/factories/make-create-subscription-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createSubscriptionBodySchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    price: z.number().positive('Preço deve ser maior que zero'),
    billing_cycle: z.enum(['monthly', 'yearly'], {
      errorMap: () => ({ message: 'Ciclo deve ser "monthly" ou "yearly"' }),
    }),
    next_payment: z.string().datetime('Data inválida'),
  })

  const { name, price, billing_cycle, next_payment } = createSubscriptionBodySchema.parse(
    request.body
  )
  const userId = (request.user as { id: string }).id

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
}
