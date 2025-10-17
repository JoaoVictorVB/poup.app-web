import { SubscriptionsRepository } from '@/repositories/ISubscriptionRepository'
import { Subscription } from '@prisma/client'
import { ValidationError } from '../errors/validation-error'

interface CreateSubscriptionUseCaseRequest {
  name: string
  price: number
  billing_cycle: 'monthly' | 'yearly'
  next_payment: Date
  user_id: string
}

interface CreateSubscriptionUseCaseResponse {
  subscription: Subscription
}

export class CreateSubscriptionUseCase {
  constructor(private subscriptionsRepository: SubscriptionsRepository) {}

  async execute(
    data: CreateSubscriptionUseCaseRequest
  ): Promise<CreateSubscriptionUseCaseResponse> {
    if (data.price <= 0) {
      throw new ValidationError('O preço deve ser maior que zero')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (data.next_payment < today) {
      throw new ValidationError('A data de pagamento não pode ser no passado')
    }

    const subscription = await this.subscriptionsRepository.create(data)

    return {
      subscription,
    }
  }
}
