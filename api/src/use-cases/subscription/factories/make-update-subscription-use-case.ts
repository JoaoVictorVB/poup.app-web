import { PrismaSubscriptionsRepository } from '@/repositories/prisma/PrismaSubscriptionRepository'
import { UpdateSubscriptionUseCase } from '../update-subscription'

export function makeUpdateSubscriptionUseCase() {
  const subscriptionsRepository = new PrismaSubscriptionsRepository()
  const useCase = new UpdateSubscriptionUseCase(subscriptionsRepository)

  return useCase
}
