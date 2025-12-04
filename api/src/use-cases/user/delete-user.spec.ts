import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user-repository'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { DeleteUserUseCase } from './delete-user'

describe('Delete User Use Case', () => {
  let usersRepository: InMemoryUserRepository
  let sut: DeleteUserUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUserRepository()
    sut = new DeleteUserUseCase(usersRepository)
  })

  it('should be able to delete user account', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    const { success } = await sut.execute({
      userId: user.id,
      password: 'Password123!',
    })

    expect(success).toBe(true)

    const deletedUser = await usersRepository.findById(user.id)
    expect(deletedUser).toBeNull()
  })

  it('should not delete with wrong password', async () => {
    const passwordHash = await hash('Password123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        password: 'WrongPassword123!',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)

    const userStillExists = await usersRepository.findById(user.id)
    expect(userStillExists).toBeTruthy()
  })

  it('should throw error if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 'non-existent-id',
        password: 'Password123!',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
