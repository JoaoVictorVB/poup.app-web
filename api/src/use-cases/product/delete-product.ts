import type { IProductRepository } from '../../repositories/IProductRepository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface DeleteProductUseCaseRequest {
  product_id: string
  user_id: string
}

export class DeleteProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute({ product_id, user_id }: DeleteProductUseCaseRequest): Promise<void> {
    const product = await this.productRepository.findById(product_id)

    if (!product) {
      throw new ResourceNotFoundError()
    }

    if (product.user_id !== user_id) {
      throw new ResourceNotFoundError()
    }

    await this.productRepository.delete(product_id)
  }
}
