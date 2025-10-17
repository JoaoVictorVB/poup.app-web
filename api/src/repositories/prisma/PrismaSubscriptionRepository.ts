import { Subscription } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import {
  CreateSubscriptionDTO,
  FindSubscriptionQuery,
  SubscriptionsRepository,
  UpdateSubscriptionDTO
} from '../ISubscriptionRepository'

export class PrismaSubscriptionsRepository implements SubscriptionsRepository {
  async findAllByUserId(userId: string): Promise<Subscription[]> {
    return prisma.subscription.findMany({
      where: { user_id: userId },
      orderBy: { next_payment: 'asc' },
    })
  }

  async findUnique(query: FindSubscriptionQuery): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: {
        id: query.id,
        user_id: query.user_id,
      },
    })
  }

  async create(data: CreateSubscriptionDTO): Promise<Subscription> {
    return prisma.subscription.create({
      data,
    })
  }

  async update(id: string, data: UpdateSubscriptionDTO): Promise<Subscription> {
    return prisma.subscription.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.subscription.delete({
      where: { id },
    })
  }

  async getTotalMonthlySpendingByUserId(userId: string): Promise<number> {
    const subscriptions = await prisma.subscription.findMany({
      where: { user_id: userId },
    })

    return subscriptions.reduce((total, sub) => {
      const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : sub.price
      return total + monthlyPrice
    }, 0)
  }
}
