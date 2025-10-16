import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ForbiddenError, NotFoundError, ValidationError } from '../lib/errors'
import { prisma } from '../lib/prisma'

export async function subscriptionRoutes(app: FastifyInstance) {
  
  app.get('/subscriptions', {
    preHandler: [app.authenticate],
  }, async (request) => {
    const userId = (request.user as { id: string }).id

    const subscriptions = await prisma.subscription.findMany({
      where: { user_id: userId },
      orderBy: { next_payment: 'asc' },
    })

    return { subscriptions }
  })

  app.post('/subscriptions', {
    preHandler: [app.authenticate],
  }, async (request) => {
    const createSubscriptionSchema = z.object({
      name: z.string().min(1, 'Nome é obrigatório'),
      price: z.number().positive('Preço deve ser maior que zero'),
      billing_cycle: z.enum(['monthly', 'yearly'], {
        errorMap: () => ({ message: 'Ciclo deve ser "monthly" ou "yearly"' }),
      }),
      next_payment: z.string().datetime('Data inválida'),
    })

    const { name, price, billing_cycle, next_payment } = createSubscriptionSchema.parse(request.body)
    const userId = (request.user as { id: string }).id

    const paymentDate = new Date(next_payment)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (paymentDate < today) {
      throw new ValidationError('A data de pagamento não pode ser no passado')
    }

    const subscription = await prisma.subscription.create({
      data: {
        name,
        price,
        billing_cycle,
        next_payment: paymentDate,
        user_id: userId,
      },
    })

    return { subscription }
  })

  app.put('/subscriptions/:id', {
    preHandler: [app.authenticate],
  }, async (request) => {
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
    const userId = (request.user as { id: string }).id

    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
    })

    if (!existingSubscription) {
      throw new NotFoundError('Assinatura não encontrada')
    }

    if (existingSubscription.user_id !== userId) {
      throw new ForbiddenError('Você não tem permissão para editar esta assinatura')
    }

    if (data.next_payment) {
      const paymentDate = new Date(data.next_payment)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (paymentDate < today) {
        throw new ValidationError('A data de pagamento não pode ser no passado')
      }
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...data,
        next_payment: data.next_payment ? new Date(data.next_payment) : undefined,
      },
    })

    return { subscription }
  })

  app.delete('/subscriptions/:id', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid('ID inválido'),
    })

    const { id } = paramsSchema.parse(request.params)
    const userId = (request.user as { id: string }).id

    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
    })

    if (!existingSubscription) {
      throw new NotFoundError('Assinatura não encontrada')
    }

    if (existingSubscription.user_id !== userId) {
      throw new ForbiddenError('Você não tem permissão para deletar esta assinatura')
    }

    await prisma.subscription.delete({
      where: { id },
    })

    return reply.status(204).send()
  })
}