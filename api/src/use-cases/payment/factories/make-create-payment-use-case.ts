import { PrismaPaymentRepository } from '../../../repositories/prisma/PrismaPaymentRepository'
import { PrismaProductRepository } from '../../../repositories/prisma/PrismaProductRepository'
import { PrismaSubscriptionsRepository } from '../../../repositories/prisma/PrismaSubscriptionRepository'
import { CreatePaymentUseCase } from '../create-payment'

export function makeCreatePaymentUseCase() {
  const paymentRepository = new PrismaPaymentRepository()
  const subscriptionRepository = new PrismaSubscriptionsRepository()
  const productRepository = new PrismaProductRepository()
  const useCase = new CreatePaymentUseCase(
    paymentRepository,
    subscriptionRepository,
    productRepository
  )

  return useCase
}
