import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user-repository'
import { AccountLockedError } from '../errors/account-locked-error'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { ValidationError } from '../errors/validation-error'
import { AuthenticateUseCase } from './authenticate'

describe('Authenticate Use Case', () => {
  let usersRepository: InMemoryUserRepository
  let sut: AuthenticateUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUserRepository()
    sut = new AuthenticateUseCase(usersRepository)
  })

  it('should be able to authenticate', async () => {
    const password = 'Password123!'
    const passwordHash = await hash(password, 8)

    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: passwordHash,
    })

    const { user } = await sut.execute({
      email: 'johndoe@example.com',
      password,
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should not be able to authenticate with wrong email', async () => {
    await expect(() =>
      sut.execute({
        email: 'johndoe@example.com',
        password: 'Password123!',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to authenticate with invalid email format', async () => {
    await expect(() =>
      sut.execute({
        email: 'invalid-email',
        password: 'Password123!',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should not be able to authenticate with empty password', async () => {
    await expect(() =>
      sut.execute({
        email: 'johndoe@example.com',
        password: '',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should not be able to authenticate with wrong password', async () => {
    const passwordHash = await hash('Password123!', 8)

    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: passwordHash,
    })

    await expect(() =>
      sut.execute({
        email: 'johndoe@example.com',
        password: 'WrongPassword123!',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should increment login attempts on failed authentication', async () => {
    const passwordHash = await hash('Password123!', 8)

    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: passwordHash,
    })

    try {
      await sut.execute({
        email: 'johndoe@example.com',
        password: 'WrongPassword123!',
      })
    } catch {
      // Expected error
    }

    const updatedUser = await usersRepository.findById(user.id)
    expect(updatedUser?.login_attempts).toBe(1)
  })

  it('should lock account after 5 failed attempts', async () => {
    const passwordHash = await hash('Password123!', 8)

    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: passwordHash,
      login_attempts: 4, // Already 4 attempts
    })

    await expect(() =>
      sut.execute({
        email: 'johndoe@example.com',
        password: 'WrongPassword123!',
      })
    ).rejects.toBeInstanceOf(AccountLockedError)

    const updatedUser = await usersRepository.findById(user.id)
    expect(updatedUser?.locked_until).toBeInstanceOf(Date)
    expect(updatedUser?.locked_until!.getTime()).toBeGreaterThan(Date.now())
  })

  it('should reset login attempts on successful authentication', async () => {
    const passwordHash = await hash('Password123!', 8)

    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: passwordHash,
      login_attempts: 3,
    })

    await sut.execute({
      email: 'johndoe@example.com',
      password: 'Password123!',
    })

    const updatedUser = await usersRepository.findById(user.id)
    expect(updatedUser?.login_attempts).toBe(0)
  })

  it('should not authenticate if account is locked', async () => {
    const passwordHash = await hash('Password123!', 8)
    const futureDate = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes in future

    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: passwordHash,
      login_attempts: 5,
      locked_until: futureDate,
    })

    await expect(() =>
      sut.execute({
        email: 'johndoe@example.com',
        password: 'Password123!',
      })
    ).rejects.toBeInstanceOf(AccountLockedError)
  })
})
