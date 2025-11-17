import { PrismaSubscriptionsRepository } from '@/repositories/prisma/PrismaSubscriptionRepository'
import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUserRepository'
import { UpdateSubscriptionUseCase } from '../update-subscription'

export function makeUpdateSubscriptionUseCase() {
  const subscriptionsRepository = new PrismaSubscriptionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const useCase = new UpdateSubscriptionUseCase(subscriptionsRepository, usersRepository)

  return useCase
}
