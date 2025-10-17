import { Subscription } from '@prisma/client'

export interface CreateSubscriptionDTO {
  name: string
  price: number
  billing_cycle: 'monthly' | 'yearly'
  next_payment: Date
  user_id: string
}

export interface UpdateSubscriptionDTO {
  name?: string
  price?: number
  billing_cycle?: 'monthly' | 'yearly'
  next_payment?: Date
}

export interface FindSubscriptionQuery {
  id?: string
  user_id?: string
}

export interface SubscriptionsRepository {
  findAllByUserId(userId: string): Promise<Subscription[]>
  findUnique(query: FindSubscriptionQuery): Promise<Subscription | null>
  create(data: CreateSubscriptionDTO): Promise<Subscription>
  update(id: string, data: UpdateSubscriptionDTO): Promise<Subscription>
  delete(id: string): Promise<void>
  getTotalMonthlySpendingByUserId(userId: string): Promise<number>
}
