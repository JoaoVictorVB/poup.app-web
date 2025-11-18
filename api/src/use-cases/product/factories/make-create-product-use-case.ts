import { PrismaProductRepository } from '../../../repositories/prisma/PrismaProductRepository'
import { CreateProductUseCase } from '../create-product'

export function makeCreateProductUseCase() {
  const productRepository = new PrismaProductRepository()
  const useCase = new CreateProductUseCase(productRepository)

  return useCase
}
