import { beforeEach, describe, expect, it } from 'vitest'
import { InMemorySubscriptionRepository } from '../../repositories/in-memory/in-memory-subscription-repository'
import { FetchUserSubscriptionsUseCase } from './fetch-user-subscriptions'

describe('Fetch User Subscriptions Use Case', () => {
  let subscriptionsRepository: InMemorySubscriptionRepository
  let sut: FetchUserSubscriptionsUseCase

  beforeEach(() => {
    subscriptionsRepository = new InMemorySubscriptionRepository()
    sut = new FetchUserSubscriptionsUseCase(subscriptionsRepository)
  })

  it('should be able to get all subscriptions for a user', async () => {
    const userId = 'user-01'

    await subscriptionsRepository.create({
      user_id: userId,
      name: 'Netflix',
      price: 45.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2025-12-01'),
    })

    await subscriptionsRepository.create({
      user_id: userId,
      name: 'Spotify',
      price: 21.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2025-12-01'),
    })

    const { subscriptions } = await sut.execute({ userId })

    expect(subscriptions).toHaveLength(2)
  })

  it('should not return subscriptions from other users (IDOR protection)', async () => {
    await subscriptionsRepository.create({
      user_id: 'user-01',
      name: 'Netflix',
      price: 45.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2025-12-01'),
    })

    await subscriptionsRepository.create({
      user_id: 'user-02',
      name: 'Spotify',
      price: 21.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2025-12-01'),
    })

    const { subscriptions } = await sut.execute({ userId: 'user-01' })

    expect(subscriptions).toHaveLength(1)
    expect(subscriptions[0].name).toBe('Netflix')
  })

  it('should return empty array if user has no subscriptions', async () => {
    const { subscriptions } = await sut.execute({ userId: 'user-01' })

    expect(subscriptions).toHaveLength(0)
    expect(subscriptions).toEqual([])
  })

  it('should calculate total monthly spending correctly', async () => {
    const userId = 'user-01'

    // Monthly: 45.90
    await subscriptionsRepository.create({
      user_id: userId,
      name: 'Netflix',
      price: 45.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2025-12-01'),
    })

    // Yearly: 240.00 / 12 = 20.00 monthly
    await subscriptionsRepository.create({
      user_id: userId,
      name: 'Amazon Prime',
      price: 240.0,
      billing_cycle: 'yearly',
      next_payment: new Date('2025-12-01'),
    })

    const totalMonthly = await subscriptionsRepository.getTotalMonthlySpendingByUserId(userId)

    expect(totalMonthly).toBeCloseTo(65.9, 2)
  })
})
