import { Subscription } from '@prisma/client'
import { randomUUID } from 'crypto'
import {
  CreateSubscriptionDTO,
  FindSubscriptionQuery,
  SubscriptionsRepository,
  UpdateSubscriptionDTO,
} from '../ISubscriptionRepository'

export class InMemorySubscriptionRepository implements SubscriptionsRepository {
  public subscriptions: Subscription[] = []

  async findUnique(query: FindSubscriptionQuery): Promise<Subscription | null> {
    const subscription = this.subscriptions.find((sub) => {
      if (query.id && query.user_id) {
        return sub.id === query.id && sub.user_id === query.user_id
      }
      if (query.id) return sub.id === query.id
      if (query.user_id) return sub.user_id === query.user_id
      return false
    })
    return subscription || null
  }

  async findAllByUserId(userId: string): Promise<Subscription[]> {
    return this.subscriptions.filter((sub) => sub.user_id === userId)
  }

  async create(data: CreateSubscriptionDTO): Promise<Subscription> {
    const subscription: Subscription = {
      id: randomUUID(),
      user_id: data.user_id,
      name: data.name,
      price: data.price,
      billing_cycle: data.billing_cycle,
      next_payment: data.next_payment,
      status: 'pending',
      created_at: new Date(),
    }

    this.subscriptions.push(subscription)
    return subscription
  }

  async update(id: string, data: UpdateSubscriptionDTO): Promise<Subscription> {
    const subIndex = this.subscriptions.findIndex((sub) => sub.id === id)

    if (subIndex === -1) {
      throw new Error('Subscription not found')
    }

    const updatedSubscription: Subscription = {
      ...this.subscriptions[subIndex],
      name: data.name || this.subscriptions[subIndex].name,
      price: data.price !== undefined ? data.price : this.subscriptions[subIndex].price,
      billing_cycle: data.billing_cycle || this.subscriptions[subIndex].billing_cycle,
      next_payment: data.next_payment || this.subscriptions[subIndex].next_payment,
      status: data.status || this.subscriptions[subIndex].status,
    }

    this.subscriptions[subIndex] = updatedSubscription
    return updatedSubscription
  }

  async delete(id: string): Promise<void> {
    const subIndex = this.subscriptions.findIndex((sub) => sub.id === id)

    if (subIndex === -1) {
      throw new Error('Subscription not found')
    }

    this.subscriptions.splice(subIndex, 1)
  }

  async getTotalMonthlySpendingByUserId(userId: string): Promise<number> {
    const userSubscriptions = this.subscriptions.filter((sub) => sub.user_id === userId)

    return userSubscriptions.reduce((total, sub) => {
      if (sub.billing_cycle === 'monthly') {
        return total + sub.price
      } else if (sub.billing_cycle === 'yearly') {
        return total + sub.price / 12
      }
      return total
    }, 0)
  }
}
