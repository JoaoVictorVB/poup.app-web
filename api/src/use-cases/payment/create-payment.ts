import type { Payment } from '@prisma/client'
import type { IPaymentRepository } from '../../repositories/IPaymentRepository'

interface CreatePaymentUseCaseRequest {
  amount: number
  payment_date?: Date
  payment_method: string
  status?: string
  notes?: string
  user_id: string
  subscription_id?: string
  product_id?: string
}

interface CreatePaymentUseCaseResponse {
  payment: Payment
}

export class CreatePaymentUseCase {
  constructor(private paymentRepository: IPaymentRepository) {}

  async execute({
    amount,
    payment_date,
    payment_method,
    status = 'paid',
    notes,
    user_id,
    subscription_id,
    product_id,
  }: CreatePaymentUseCaseRequest): Promise<CreatePaymentUseCaseResponse> {
    const payment = await this.paymentRepository.create({
      amount,
      payment_date: payment_date || new Date(),
      payment_method,
      status,
      notes,
      user: {
        connect: { id: user_id },
      },
      ...(subscription_id && {
        subscription: {
          connect: { id: subscription_id },
        },
      }),
      ...(product_id && {
        product: {
          connect: { id: product_id },
        },
      }),
    })

    return { payment }
  }
}
