import { PrismaProductRepository } from '../../../repositories/prisma/PrismaProductRepository'
import { UpdateProductUseCase } from '../update-product'

export function makeUpdateProductUseCase() {
  const productRepository = new PrismaProductRepository()
  const useCase = new UpdateProductUseCase(productRepository)

  return useCase
}
