import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateProductUseCase } from '../../../use-cases/product/factories/make-update-product-use-case'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateProductParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const updateProductBodySchema = z.object({
    name: z.string().optional(),
    category: z
      .enum(['food', 'transport', 'entertainment', 'health', 'shopping', 'other'])
      .optional(),
    total_price: z.number().positive().optional(),
    installments: z.number().int().positive().optional(),
    paid_installments: z.number().int().min(0).optional(),
    installment_value: z.number().positive().optional(),
    next_payment: z.string().optional(),
    status: z.enum(['paid', 'pending', 'partial']).optional(),
    description: z.string().optional(),
  })

  const { id } = updateProductParamsSchema.parse(request.params)
  const {
    name,
    category,
    total_price,
    installments,
    paid_installments,
    installment_value,
    next_payment,
    status,
    description,
  } = updateProductBodySchema.parse(request.body)

  const updateProductUseCase = makeUpdateProductUseCase()

  const { product } = await updateProductUseCase.execute({
    product_id: id,
    user_id: request.user.sub,
    name,
    category,
    total_price,
    installments,
    paid_installments,
    installment_value,
    next_payment,
    status,
    description,
  })

  return reply.status(200).send({ product })
}
