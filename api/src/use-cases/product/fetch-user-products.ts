import type { Product } from '@prisma/client'
import type { IProductRepository } from '../../repositories/IProductRepository'

interface FetchUserProductsUseCaseRequest {
  user_id: string
}

interface FetchUserProductsUseCaseResponse {
  products: Product[]
}

export class FetchUserProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute({
    user_id,
  }: FetchUserProductsUseCaseRequest): Promise<FetchUserProductsUseCaseResponse> {
    const products = await this.productRepository.findByUserId(user_id)

    return { products }
  }
}
