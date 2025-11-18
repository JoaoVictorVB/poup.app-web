import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeDeleteProductUseCase } from '../../../use-cases/product/factories/make-delete-product-use-case'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteProductParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = deleteProductParamsSchema.parse(request.params)

  const deleteProductUseCase = makeDeleteProductUseCase()

  await deleteProductUseCase.execute({
    product_id: id,
    user_id: request.user.sub,
  })

  return reply.status(204).send()
}
