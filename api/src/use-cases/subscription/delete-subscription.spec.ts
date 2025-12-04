import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemorySubscriptionRepository } from '../../repositories/in-memory/in-memory-subscription-repository'
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user-repository'
import { ForbiddenError } from '../errors/forbidden-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { DeleteSubscriptionUseCase } from './delete-subscription'

describe('Delete Subscription Use Case', () => {
  let subscriptionsRepository: InMemorySubscriptionRepository
  let usersRepository: InMemoryUserRepository
  let sut: DeleteSubscriptionUseCase

  beforeEach(() => {
    subscriptionsRepository = new InMemorySubscriptionRepository()
    usersRepository = new InMemoryUserRepository()
    sut = new DeleteSubscriptionUseCase(subscriptionsRepository, usersRepository)
  })

  it('should be able to delete subscription', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const subscription = await subscriptionsRepository.create({
      user_id: user.id,
      name: 'Netflix',
      price: 45.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2025-12-01'),
    })

    await sut.execute({
      subscriptionId: subscription.id,
      userId: user.id,
    })

    const deletedSub = await subscriptionsRepository.findUnique({
      id: subscription.id,
    })
    expect(deletedSub).toBeNull()
  })

  it('should not delete subscription of another user (IDOR protection)', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user1 = await usersRepository.create({
      name: 'User 1',
      email: 'user1@example.com',
      password_hash: passwordHash,
    })

    const user2 = await usersRepository.create({
      name: 'User 2',
      email: 'user2@example.com',
      password_hash: passwordHash,
    })

    const subscription = await subscriptionsRepository.create({
      user_id: user1.id,
      name: 'Netflix',
      price: 45.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2025-12-01'),
    })

    await expect(() =>
      sut.execute({
        subscriptionId: subscription.id,
        userId: user2.id,
      })
    ).rejects.toBeInstanceOf(ForbiddenError)

    const subscriptionStillExists = await subscriptionsRepository.findUnique({
      id: subscription.id,
    })
    expect(subscriptionStillExists).toBeTruthy()
  })

  it('should throw error if subscription does not exist', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    await expect(() =>
      sut.execute({
        subscriptionId: 'non-existent-id',
        userId: user.id,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
