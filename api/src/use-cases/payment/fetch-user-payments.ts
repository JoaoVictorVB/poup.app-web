import type { Payment } from '@prisma/client'
import type { IPaymentRepository } from '../../repositories/IPaymentRepository'

interface FetchUserPaymentsUseCaseRequest {
  user_id: string
}

interface FetchUserPaymentsUseCaseResponse {
  payments: Payment[]
}

export class FetchUserPaymentsUseCase {
  constructor(private paymentRepository: IPaymentRepository) {}

  async execute({
    user_id,
  }: FetchUserPaymentsUseCaseRequest): Promise<FetchUserPaymentsUseCaseResponse> {
    const payments = await this.paymentRepository.findByUserId(user_id)

    return { payments }
  }
}
