import type { FastifyReply, FastifyRequest } from 'fastify'
import { makeFetchUserProductsUseCase } from '../../../use-cases/product/factories/make-fetch-user-products-use-case'

export async function fetch(request: FastifyRequest, reply: FastifyReply) {
  const fetchUserProductsUseCase = makeFetchUserProductsUseCase()

  const { products } = await fetchUserProductsUseCase.execute({
    user_id: request.user.sub,
  })

  return reply.status(200).send({ products })
}
