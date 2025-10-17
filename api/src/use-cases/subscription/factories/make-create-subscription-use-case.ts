import { PrismaSubscriptionsRepository } from '@/repositories/prisma/PrismaSubscriptionRepository'
import { CreateSubscriptionUseCase } from '../create-subscription'

export function makeCreateSubscriptionUseCase() {
  const subscriptionsRepository = new PrismaSubscriptionsRepository()
  const useCase = new CreateSubscriptionUseCase(subscriptionsRepository)

  return useCase
}
