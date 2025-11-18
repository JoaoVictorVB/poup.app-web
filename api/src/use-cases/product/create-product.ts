import type { Product } from '@prisma/client'
import type { IProductRepository } from '../../repositories/IProductRepository'

interface CreateProductUseCaseRequest {
  name: string
  category: string
  total_price: number
  installments: number
  paid_installments: number
  installment_value: number
  purchase_date?: Date
  next_payment?: Date
  description?: string
  status: string
  user_id: string
}

interface CreateProductUseCaseResponse {
  product: Product
}

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute({
    name,
    category,
    total_price,
    installments,
    paid_installments,
    installment_value,
    purchase_date,
    next_payment,
    description,
    status,
    user_id,
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    const product = await this.productRepository.create({
      name,
      category,
      total_price,
      installments,
      paid_installments,
      installment_value,
      purchase_date: purchase_date || new Date(),
      next_payment,
      description,
      status,
      user: {
        connect: { id: user_id },
      },
    })

    return { product }
  }
}
