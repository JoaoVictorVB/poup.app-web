import { PrismaPaymentRepository } from '../../../repositories/prisma/PrismaPaymentRepository'
import { CreatePaymentUseCase } from '../create-payment'

export function makeCreatePaymentUseCase() {
  const paymentRepository = new PrismaPaymentRepository()
  const useCase = new CreatePaymentUseCase(paymentRepository)

  return useCase
}
