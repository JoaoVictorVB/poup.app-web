import { PrismaProductRepository } from '../../../repositories/prisma/PrismaProductRepository'
import { DeleteProductUseCase } from '../delete-product'

export function makeDeleteProductUseCase() {
  const productRepository = new PrismaProductRepository()
  const useCase = new DeleteProductUseCase(productRepository)

  return useCase
}
