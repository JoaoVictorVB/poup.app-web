import { PrismaPaymentRepository } from '../../../repositories/prisma/PrismaPaymentRepository'
import { FetchUserPaymentsUseCase } from '../fetch-user-payments'

export function makeFetchUserPaymentsUseCase() {
  const paymentRepository = new PrismaPaymentRepository()
  const useCase = new FetchUserPaymentsUseCase(paymentRepository)

  return useCase
}
