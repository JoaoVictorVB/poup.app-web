import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { ValidationError } from '../errors/validation-error'
import { UpdateUserUseCase } from './update-user'

describe('Update User Use Case', () => {
  let usersRepository: InMemoryUserRepository
  let sut: UpdateUserUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUserRepository()
    sut = new UpdateUserUseCase(usersRepository)
  })

  it('should be able to update user name', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const { user: updatedUser } = await sut.execute({
      userId: user.id,
      name: 'Jane Doe',
    })

    expect(updatedUser.name).toBe('Jane Doe')
  })

  it('should be able to update user email', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const { user: updatedUser } = await sut.execute({
      userId: user.id,
      email: 'newemail@example.com',
    })

    expect(updatedUser.email).toBe('newemail@example.com')
  })

  it('should be able to update both name and email', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const { user: updatedUser } = await sut.execute({
      userId: user.id,
      name: 'Jane Doe',
      email: 'jane@example.com',
    })

    expect(updatedUser.name).toBe('Jane Doe')
    expect(updatedUser.email).toBe('jane@example.com')
  })

  it('should not update with duplicate email', async () => {
    const passwordHash = await hash('Password123!', 8)

    await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const user2 = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: passwordHash,
    })

    await expect(() =>
      sut.execute({
        userId: user2.id,
        email: 'john@example.com',
      })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  it('should validate email format', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        email: 'invalid-email',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should throw error if no changes provided', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should not expose sensitive data', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const { user: updatedUser } = await sut.execute({
      userId: user.id,
      name: 'Jane Doe',
    })

    expect(updatedUser).not.toHaveProperty('password_hash')
    expect(updatedUser).not.toHaveProperty('password_history')
    expect(updatedUser).not.toHaveProperty('login_attempts')
    expect(updatedUser).not.toHaveProperty('locked_until')
  })

  it('should throw error if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 'non-existent-id',
        name: 'Jane Doe',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
