import type { Payment, Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import type { IPaymentRepository } from '../IPaymentRepository'

export class PrismaPaymentRepository implements IPaymentRepository {
  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    const payment = await prisma.payment.create({
      data,
      include: {
        subscription: true,
        product: true,
      },
    })
    return payment
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        subscription: true,
        product: true,
      },
    })
    return payment
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({
      where: { user_id: userId },
      include: {
        subscription: true,
        product: true,
      },
      orderBy: { payment_date: 'desc' },
    })
    return payments
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({
      where: { subscription_id: subscriptionId },
      orderBy: { payment_date: 'desc' },
    })
    return payments
  }

  async findByProductId(productId: string): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({
      where: { product_id: productId },
      orderBy: { payment_date: 'desc' },
    })
    return payments
  }

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    const payment = await prisma.payment.update({
      where: { id },
      data,
      include: {
        subscription: true,
        product: true,
      },
    })
    return payment
  }

  async delete(id: string): Promise<void> {
    await prisma.payment.delete({
      where: { id },
    })
  }
}
