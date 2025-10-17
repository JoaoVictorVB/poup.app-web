import { PrismaSubscriptionsRepository } from '@/repositories/prisma/PrismaSubscriptionRepository'
import { FetchUserSubscriptionsUseCase } from '../fetch-user-subscriptions'

export function makeFetchUserSubscriptionsUseCase() {
  const subscriptionsRepository = new PrismaSubscriptionsRepository()
  const useCase = new FetchUserSubscriptionsUseCase(subscriptionsRepository)

  return useCase
}
