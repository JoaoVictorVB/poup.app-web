import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCreateProductUseCase } from '../../../use-cases/product/factories/make-create-product-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createProductBodySchema = z.object({
    name: z.string(),
    category: z.enum(['food', 'transport', 'entertainment', 'health', 'shopping', 'other']),
    total_price: z.number().positive(),
    installments: z.number().int().positive().default(1),
    paid_installments: z.number().int().min(0).default(0),
    installment_value: z.number().positive(),
    purchase_date: z.coerce.date().optional(),
    next_payment: z.coerce.date().optional(),
    description: z.string().optional(),
    status: z.enum(['paid', 'pending', 'partial']).default('pending'),
  })

  const {
    name,
    category,
    total_price,
    installments,
    paid_installments,
    installment_value,
    purchase_date,
    next_payment,
    description,
    status,
  } = createProductBodySchema.parse(request.body)

  const createProductUseCase = makeCreateProductUseCase()

  const { product } = await createProductUseCase.execute({
    name,
    category,
    total_price,
    installments,
    paid_installments,
    installment_value,
    purchase_date,
    next_payment,
    description,
    status,
    user_id: request.user.sub,
  })

  return reply.status(201).send({ product })
}
