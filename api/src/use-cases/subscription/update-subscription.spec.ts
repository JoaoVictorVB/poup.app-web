import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemorySubscriptionRepository } from '../../repositories/in-memory/in-memory-subscription-repository'
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user-repository'
import { ForbiddenError } from '../errors/forbidden-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { ValidationError } from '../errors/validation-error'
import { UpdateSubscriptionUseCase } from './update-subscription'

describe('Update Subscription Use Case', () => {
  let subscriptionsRepository: InMemorySubscriptionRepository
  let usersRepository: InMemoryUserRepository
  let sut: UpdateSubscriptionUseCase

  beforeEach(() => {
    subscriptionsRepository = new InMemorySubscriptionRepository()
    usersRepository = new InMemoryUserRepository()
    sut = new UpdateSubscriptionUseCase(subscriptionsRepository, usersRepository)
  })

  it('should be able to update subscription', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const createdSub = await subscriptionsRepository.create({
      user_id: user.id,
      name: 'Netflix',
      price: 45.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2025-12-01'),
    })

    const { subscription } = await sut.execute({
      subscriptionId: createdSub.id,
      userId: user.id,
      data: {
        name: 'Netflix Premium',
        price: 55.9,
      },
    })

    expect(subscription.name).toBe('Netflix Premium')
    expect(subscription.price).toBe(55.9)
  })

  it('should not update subscription of another user (IDOR protection)', async () => {
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
        data: {
          name: 'Hacked',
        },
      })
    ).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('should validate price is positive', async () => {
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

    await expect(() =>
      sut.execute({
        subscriptionId: subscription.id,
        userId: user.id,
        data: {
          price: -10,
        },
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should validate next payment date is not in the past', async () => {
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

    await expect(() =>
      sut.execute({
        subscriptionId: subscription.id,
        userId: user.id,
        data: {
          next_payment: new Date('2020-01-01'),
        },
      })
    ).rejects.toBeInstanceOf(ValidationError)
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
        data: {
          name: 'Updated',
        },
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
