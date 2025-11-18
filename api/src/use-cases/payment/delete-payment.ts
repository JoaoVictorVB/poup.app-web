import type { IPaymentRepository } from '../../repositories/IPaymentRepository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface DeletePaymentUseCaseRequest {
  payment_id: string
  user_id: string
}

export class DeletePaymentUseCase {
  constructor(private paymentRepository: IPaymentRepository) {}

  async execute({ payment_id, user_id }: DeletePaymentUseCaseRequest): Promise<void> {
    const payment = await this.paymentRepository.findById(payment_id)

    if (!payment) {
      throw new ResourceNotFoundError()
    }

    if (payment.user_id !== user_id) {
      throw new ResourceNotFoundError()
    }

    await this.paymentRepository.delete(payment_id)
  }
}
