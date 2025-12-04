import { compare, hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/in-memory/in-memory-user-repository'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { ValidationError } from '../errors/validation-error'
import { UpdatePasswordUseCase } from './update-password'

describe('Update Password Use Case', () => {
  let usersRepository: InMemoryUserRepository
  let sut: UpdatePasswordUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUserRepository()
    sut = new UpdatePasswordUseCase(usersRepository)
  })

  it('should be able to update password', async () => {
    const oldPasswordHash = await hash('OldPassword123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: oldPasswordHash,
    })

    const { success } = await sut.execute({
      userId: user.id,
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
    })

    expect(success).toBe(true)

    const updatedUser = await usersRepository.findById(user.id)
    const newPasswordMatches = await compare('NewPassword456!', updatedUser!.password_hash)
    expect(newPasswordMatches).toBe(true)
  })

  it('should not update with wrong current password', async () => {
    const oldPasswordHash = await hash('OldPassword123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: oldPasswordHash,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        currentPassword: 'WrongPassword!',
        newPassword: 'NewPassword456!',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should validate new password has minimum 10 characters', async () => {
    const oldPasswordHash = await hash('OldPassword123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: oldPasswordHash,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        currentPassword: 'OldPassword123!',
        newPassword: 'Short1!',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should validate new password has uppercase letter', async () => {
    const oldPasswordHash = await hash('OldPassword123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: oldPasswordHash,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        currentPassword: 'OldPassword123!',
        newPassword: 'newpassword123!',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should validate new password has lowercase letter', async () => {
    const oldPasswordHash = await hash('OldPassword123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: oldPasswordHash,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        currentPassword: 'OldPassword123!',
        newPassword: 'NEWPASSWORD123!',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should validate new password has number', async () => {
    const oldPasswordHash = await hash('OldPassword123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: oldPasswordHash,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword!',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should validate new password has special character', async () => {
    const oldPasswordHash = await hash('OldPassword123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: oldPasswordHash,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should not allow reusing recent passwords', async () => {
    const oldPasswordHash = await hash('OldPassword123!', 8)
    const passwordHistory = JSON.stringify([oldPasswordHash])

    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: oldPasswordHash,
      password_history: passwordHistory,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        currentPassword: 'OldPassword123!',
        newPassword: 'OldPassword123!',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('should store password in history', async () => {
    const oldPasswordHash = await hash('OldPassword123!', 8)
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: oldPasswordHash,
    })

    await sut.execute({
      userId: user.id,
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
    })

    const updatedUser = await usersRepository.findById(user.id)
    expect(updatedUser!.password_history).toBeTruthy()

    const history = JSON.parse(updatedUser!.password_history!)
    expect(history).toBeInstanceOf(Array)
    expect(history.length).toBeGreaterThan(0)
  })

  it('should throw error if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 'non-existent-id',
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword456!',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
