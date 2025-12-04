import type { Payment, Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import type { IPaymentRepository } from '../IPaymentRepository'

export class InMemoryPaymentRepository implements IPaymentRepository {
  public items: Payment[] = []

  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    const payment: Payment = {
      id: randomUUID(),
      amount: data.amount,
      payment_date: data.payment_date ? new Date(data.payment_date) : new Date(),
      payment_method: data.payment_method,
      status: data.status ?? 'paid',
      notes: data.notes ?? null,
      created_at: new Date(),
      user_id: data.user.connect?.id ?? '',
      subscription_id: data.subscription?.connect?.id ?? null,
      product_id: data.product?.connect?.id ?? null,
    }

    this.items.push(payment)

    return payment
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = this.items.find((item) => item.id === id)

    if (!payment) {
      return null
    }

    return payment
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    return this.items.filter((item) => item.user_id === userId)
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Payment[]> {
    return this.items.filter((item) => item.subscription_id === subscriptionId)
  }

  async findByProductId(productId: string): Promise<Payment[]> {
    return this.items.filter((item) => item.product_id === productId)
  }

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    const paymentIndex = this.items.findIndex((item) => item.id === id)

    if (paymentIndex === -1) {
      throw new Error('Payment not found')
    }

    const payment = this.items[paymentIndex]

    const updatedPayment: Payment = {
      ...payment,
      amount: data.amount !== undefined ? Number(data.amount) : payment.amount,
      payment_date:
        data.payment_date !== undefined
          ? new Date(data.payment_date as Date)
          : payment.payment_date,
      payment_method:
        data.payment_method !== undefined ? String(data.payment_method) : payment.payment_method,
      status: data.status !== undefined ? String(data.status) : payment.status,
      notes: data.notes !== undefined ? String(data.notes) : payment.notes,
    }

    this.items[paymentIndex] = updatedPayment

    return updatedPayment
  }

  async delete(id: string): Promise<void> {
    const paymentIndex = this.items.findIndex((item) => item.id === id)

    if (paymentIndex !== -1) {
      this.items.splice(paymentIndex, 1)
    }
  }
}
