import { SubscriptionsRepository } from '@/repositories/ISubscriptionRepository'
import { Subscription } from '@prisma/client'

interface FetchUserSubscriptionsUseCaseRequest {
  userId: string
}

interface FetchUserSubscriptionsUseCaseResponse {
  subscriptions: Subscription[]
}

export class FetchUserSubscriptionsUseCase {
  constructor(private subscriptionsRepository: SubscriptionsRepository) {}

  async execute({
    userId,
  }: FetchUserSubscriptionsUseCaseRequest): Promise<FetchUserSubscriptionsUseCaseResponse> {
    const subscriptions = await this.subscriptionsRepository.findAllByUserId(userId)

    return {
      subscriptions,
    }
  }
}
