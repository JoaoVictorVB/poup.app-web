import { SubscriptionsRepository, UpdateSubscriptionDTO } from '@/repositories/ISubscriptionRepository'
import { UsersRepository } from '@/repositories/IUserRepository'
import { Subscription } from '@prisma/client'
import { logger } from '../../lib/logger'
import { ForbiddenError } from '../errors/forbidden-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { ValidationError } from '../errors/validation-error'

interface UpdateSubscriptionUseCaseRequest {
  subscriptionId: string
  userId: string
  data: UpdateSubscriptionDTO
}

interface UpdateSubscriptionUseCaseResponse {
  subscription: Subscription
}

export class UpdateSubscriptionUseCase {
  constructor(
    private subscriptionsRepository: SubscriptionsRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute({
    subscriptionId,
    userId,
    data,
  }: UpdateSubscriptionUseCaseRequest): Promise<UpdateSubscriptionUseCaseResponse> {
    const existingSubscription = await this.subscriptionsRepository.findUnique({
      id: subscriptionId,
    })

    if (!existingSubscription) {
      throw new ResourceNotFoundError('Subscription')
    }

    if (existingSubscription.user_id !== userId) {
      throw new ForbiddenError('You do not have permission to update this subscription')
    }

    if (data.price !== undefined && data.price <= 0) {
      throw new ValidationError('O preço deve ser maior que zero')
    }

    if (data.next_payment) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (data.next_payment < today) {
        throw new ValidationError('A data de pagamento não pode ser no passado')
      }
    }

    const subscription = await this.subscriptionsRepository.update(subscriptionId, data)

    const user = await this.usersRepository.findById(userId)
    if (user) {
      const changes: string[] = []
      if (data.name) changes.push('name')
      if (data.price) changes.push('price')
      if (data.billing_cycle) changes.push('billing_cycle')
      if (data.next_payment) changes.push('next_payment')
      logger.logSubscriptionUpdated(user.name, user.id, subscription.name, changes)
    }

    return {
      subscription,
    }
  }
}
