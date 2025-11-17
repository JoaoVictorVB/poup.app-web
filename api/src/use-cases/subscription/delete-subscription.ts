import { SubscriptionsRepository } from '@/repositories/ISubscriptionRepository'
import { UsersRepository } from '@/repositories/IUserRepository'
import { logger } from '../../lib/logger'
import { ForbiddenError } from '../errors/forbidden-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface DeleteSubscriptionUseCaseRequest {
  subscriptionId: string
  userId: string
}

export class DeleteSubscriptionUseCase {
  constructor(
    private subscriptionsRepository: SubscriptionsRepository,
    private usersRepository: UsersRepository
  ) {}

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

    const user = await this.usersRepository.findById(userId)
    if (user) {
      logger.logSubscriptionDeleted(user.name, user.id, existingSubscription.name)
    }

    await this.subscriptionsRepository.delete(subscriptionId)
  }
}
