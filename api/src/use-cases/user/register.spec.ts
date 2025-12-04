import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user-repository'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { ValidationError } from '../errors/validation-error'
import { RegisterUseCase } from './register'

describe('Register Use Case', () => {
  let usersRepository: InMemoryUserRepository
  let sut: RegisterUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUserRepository()
    sut = new RegisterUseCase(usersRepository)
  })

  it('should be able to register a new user', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Password123!',
    })

    expect(user.id).toEqual(expect.any(String))
    expect(user.name).toBe('John Doe')
    expect(user.email).toBe('johndoe@example.com')
  })

  it('should hash user password upon registration', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Password123!',
    })

    const userInDb = await usersRepository.findById(user.id)
    expect(userInDb?.password_hash).not.toBe('Password123!')
    expect(userInDb?.password_hash).toMatch(/^\$2a\$08\$/)
  })

  it('should not be able to register with same email twice', async () => {
    const email = 'johndoe@example.com'

    await sut.execute({
      name: 'John Doe',
      email,
      password: 'Password123!',
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email,
        password: 'Password123!',
      })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  it('should not be able to register with invalid email', async () => {
    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123!',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should not be able to register with password less than 10 characters', async () => {
    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'Pass123!',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should not be able to register without uppercase letter', async () => {
    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123!',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should not be able to register without lowercase letter', async () => {
    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'PASSWORD123!',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should not be able to register without number', async () => {
    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'PasswordPass!',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should not be able to register without special character', async () => {
    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'Password1234',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should initialize user with password history', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Password123!',
    })

    const userInDb = await usersRepository.findById(user.id)
    expect(userInDb?.password_history).not.toBeNull()

    const history = JSON.parse(userInDb!.password_history!)
    expect(history).toHaveLength(1)
  })

  it('should create user with creation timestamp', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Password123!',
    })

    expect(user.created_at).toBeInstanceOf(Date)
  })
})
