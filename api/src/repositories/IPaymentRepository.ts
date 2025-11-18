import type { Payment, Prisma } from '@prisma/client'

export interface IPaymentRepository {
  create(data: Prisma.PaymentCreateInput): Promise<Payment>
  findById(id: string): Promise<Payment | null>
  findByUserId(userId: string): Promise<Payment[]>
  findBySubscriptionId(subscriptionId: string): Promise<Payment[]>
  findByProductId(productId: string): Promise<Payment[]>
  update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment>
  delete(id: string): Promise<void>
}
