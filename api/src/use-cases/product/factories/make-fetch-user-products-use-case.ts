import { PrismaProductRepository } from '../../../repositories/prisma/PrismaProductRepository'
import { FetchUserProductsUseCase } from '../fetch-user-products'

export function makeFetchUserProductsUseCase() {
  const productRepository = new PrismaProductRepository()
  const useCase = new FetchUserProductsUseCase(productRepository)

  return useCase
}
