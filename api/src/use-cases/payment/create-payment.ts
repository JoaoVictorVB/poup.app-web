import type { Payment } from '@prisma/client'
import type { IPaymentRepository } from '../../repositories/IPaymentRepository'
import type { IProductRepository } from '../../repositories/IProductRepository'
import type { SubscriptionsRepository } from '../../repositories/ISubscriptionRepository'

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
  constructor(
    private paymentRepository: IPaymentRepository,
    private subscriptionRepository: SubscriptionsRepository,
    private productRepository: IProductRepository
  ) {}

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

    // Atualizar subscription se o pagamento for para uma assinatura e estiver pago
    if (subscription_id && status === 'paid') {
      const subscription = await this.subscriptionRepository.findUnique({ id: subscription_id })
      if (subscription) {
        const currentNextPayment = new Date(subscription.next_payment)
        const newNextPayment = new Date(currentNextPayment)

        // Adicionar um mês ou um ano dependendo do ciclo
        if (subscription.billing_cycle === 'monthly') {
          newNextPayment.setMonth(newNextPayment.getMonth() + 1)
        } else {
          newNextPayment.setFullYear(newNextPayment.getFullYear() + 1)
        }

        await this.subscriptionRepository.update(subscription_id, {
          status: 'paid',
          next_payment: newNextPayment,
        })
      }
    }

    // Atualizar product se o pagamento for para um produto e estiver pago
    if (product_id && status === 'paid') {
      const product = await this.productRepository.findById(product_id)
      if (product) {
        const paidInstallments = product.paid_installments + 1
        const newStatus = paidInstallments >= product.installments ? 'paid' : 'partial'

        // Calcular próxima parcela
        let newNextPayment = null
        if (paidInstallments < product.installments && product.next_payment) {
          const currentNextPayment = new Date(product.next_payment)
          newNextPayment = new Date(currentNextPayment)
          newNextPayment.setMonth(newNextPayment.getMonth() + 1)
        }

        await this.productRepository.update(product_id, {
          paid_installments: paidInstallments,
          status: newStatus,
          next_payment: newNextPayment,
        })
      }
    }

    return { payment }
  }
}
