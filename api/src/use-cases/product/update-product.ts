import type { Product } from '@prisma/client'
import type { IProductRepository } from '../../repositories/IProductRepository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface UpdateProductUseCaseRequest {
  product_id: string
  user_id: string
  name?: string
  category?: string
  total_price?: number
  installments?: number
  paid_installments?: number
  installment_value?: number
  next_payment?: string
  status?: string
  description?: string
}

interface UpdateProductUseCaseResponse {
  product: Product
}

export class UpdateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute({
    product_id,
    user_id,
    name,
    category,
    total_price,
    installments,
    paid_installments,
    installment_value,
    next_payment,
    status,
    description,
  }: UpdateProductUseCaseRequest): Promise<UpdateProductUseCaseResponse> {
    const product = await this.productRepository.findById(product_id)

    if (!product) {
      throw new ResourceNotFoundError()
    }

    if (product.user_id !== user_id) {
      throw new ResourceNotFoundError()
    }

    const updatedProduct = await this.productRepository.update(product_id, {
      name,
      category,
      total_price,
      installments,
      paid_installments,
      installment_value,
      next_payment: next_payment ? new Date(next_payment) : undefined,
      status,
      description,
    })

    return { product: updatedProduct }
  }
}
