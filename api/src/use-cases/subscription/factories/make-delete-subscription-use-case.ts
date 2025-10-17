import { PrismaSubscriptionsRepository } from '@/repositories/prisma/PrismaSubscriptionRepository'
import { DeleteSubscriptionUseCase } from '../delete-subscription'

export function makeDeleteSubscriptionUseCase() {
  const subscriptionsRepository = new PrismaSubscriptionsRepository()
  const useCase = new DeleteSubscriptionUseCase(subscriptionsRepository)

  return useCase
}
