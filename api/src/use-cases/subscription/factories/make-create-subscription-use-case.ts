import { PrismaSubscriptionsRepository } from '@/repositories/prisma/PrismaSubscriptionRepository'
import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUserRepository'
import { CreateSubscriptionUseCase } from '../create-subscription'

export function makeCreateSubscriptionUseCase() {
  const subscriptionsRepository = new PrismaSubscriptionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const useCase = new CreateSubscriptionUseCase(subscriptionsRepository, usersRepository)

  return useCase
}
