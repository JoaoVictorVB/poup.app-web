import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { GetUserProfileUseCase } from './get-user-profile'

describe('Get User Profile Use Case', () => {
  let usersRepository: InMemoryUserRepository
  let sut: GetUserProfileUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUserRepository()
    sut = new GetUserProfileUseCase(usersRepository)
  })

  it('should be able to get user profile', async () => {
    const passwordHash = await hash('Password123!', 8)
    const createdUser = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const { user } = await sut.execute({
      userId: createdUser.id,
    })

    expect(user.id).toBe(createdUser.id)
    expect(user.name).toBe('John Doe')
    expect(user.email).toBe('john@example.com')
  })

  it('should not expose password hash', async () => {
    const passwordHash = await hash('Password123!', 8)
    const createdUser = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const { user } = await sut.execute({
      userId: createdUser.id,
    })

    expect(user).not.toHaveProperty('password_hash')
  })

  it('should throw error if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 'non-existent-id',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
