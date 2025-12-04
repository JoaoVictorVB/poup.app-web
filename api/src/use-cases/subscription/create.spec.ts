import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemorySubscriptionRepository } from '../../repositories/in-memory/in-memory-subscription-repository'
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user-repository'
import { CreateSubscriptionUseCase } from './create-subscription'

describe('Create Subscription Use Case', () => {
  let subscriptionsRepository: InMemorySubscriptionRepository
  let usersRepository: InMemoryUserRepository
  let sut: CreateSubscriptionUseCase

  beforeEach(() => {
    subscriptionsRepository = new InMemorySubscriptionRepository()
    usersRepository = new InMemoryUserRepository()
    sut = new CreateSubscriptionUseCase(subscriptionsRepository, usersRepository)
  })

  it('should be able to create a monthly subscription', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const { subscription } = await sut.execute({
      user_id: user.id,
      name: 'Netflix',
      price: 45.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2025-12-01'),
    })

    expect(subscription.id).toEqual(expect.any(String))
    expect(subscription.name).toBe('Netflix')
    expect(subscription.price).toBe(45.9)
    expect(subscription.billing_cycle).toBe('monthly')
  })

  it('should be able to create a yearly subscription', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const { subscription } = await sut.execute({
      user_id: user.id,
      name: 'Amazon Prime',
      price: 149.9,
      billing_cycle: 'yearly',
      next_payment: new Date('2025-12-01'),
    })

    expect(subscription.billing_cycle).toBe('yearly')
    expect(subscription.price).toBe(149.9)
  })

  it('should initialize subscription with pending status', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const { subscription } = await sut.execute({
      user_id: user.id,
      name: 'Spotify',
      price: 21.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2025-12-01'),
    })

    expect(subscription.status).toBe('pending')
  })

  it('should create subscription even if user does not exist', async () => {
    const { subscription } = await sut.execute({
      user_id: 'non-existent-id',
      name: 'Netflix',
      price: 45.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2025-12-01'),
    })

    expect(subscription.user_id).toBe('non-existent-id')
  })

  it('should associate subscription to correct user', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const { subscription } = await sut.execute({
      user_id: user.id,
      name: 'Netflix',
      price: 45.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2025-12-01'),
    })

    expect(subscription.user_id).toBe(user.id)
  })
})
