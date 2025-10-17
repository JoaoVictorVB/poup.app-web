import { SubscriptionsRepository } from '@/repositories/ISubscriptionRepository'
import { ForbiddenError } from '../errors/forbidden-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface DeleteSubscriptionUseCaseRequest {
  subscriptionId: string
  userId: string
}

export class DeleteSubscriptionUseCase {
  constructor(private subscriptionsRepository: SubscriptionsRepository) {}

  async execute({
    subscriptionId,
    userId,
  }: DeleteSubscriptionUseCaseRequest): Promise<void> {
    const existingSubscription = await this.subscriptionsRepository.findUnique({
      id: subscriptionId,
    })

    if (!existingSubscription) {
      throw new ResourceNotFoundError('Subscription')
    }

    if (existingSubscription.user_id !== userId) {
      throw new ForbiddenError('You do not have permission to delete this subscription')
    }

    await this.subscriptionsRepository.delete(subscriptionId)
  }
}
