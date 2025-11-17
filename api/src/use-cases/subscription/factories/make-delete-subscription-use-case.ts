import { PrismaSubscriptionsRepository } from '@/repositories/prisma/PrismaSubscriptionRepository'
import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUserRepository'
import { DeleteSubscriptionUseCase } from '../delete-subscription'

export function makeDeleteSubscriptionUseCase() {
  const subscriptionsRepository = new PrismaSubscriptionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const useCase = new DeleteSubscriptionUseCase(subscriptionsRepository, usersRepository)

  return useCase
}
