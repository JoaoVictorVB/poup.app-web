import { PrismaPaymentRepository } from '../../../repositories/prisma/PrismaPaymentRepository'
import { DeletePaymentUseCase } from '../delete-payment'

export function makeDeletePaymentUseCase() {
  const paymentRepository = new PrismaPaymentRepository()
  const useCase = new DeletePaymentUseCase(paymentRepository)

  return useCase
}
