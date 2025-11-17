import { UsersRepository } from '@/repositories/IUserRepository'
import { User } from '@prisma/client'
import { logger } from '../../lib/logger'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { ValidationError } from '../errors/validation-error'

interface UpdateUserUseCaseRequest {
  userId: string
  name?: string
  email?: string
}

interface UpdateUserUseCaseResponse {
  user: Omit<User, 'password_hash' | 'password_history' | 'login_attempts' | 'locked_until'>
}

export class UpdateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  async execute({
    userId,
    name,
    email,
  }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    const user = await this.usersRepository.findUnique({ id: userId })

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const changes: string[] = []

    if (email && email !== user.email) {
      if (!this.validateEmail(email)) {
        throw new ValidationError('Email inválido. Por favor, insira um email válido.')
      }

      const emailExists = await this.usersRepository.findUnique({ email })
      if (emailExists) {
        throw new UserAlreadyExistsError()
      }

      changes.push(`email: ${user.email} → ${email}`)
    }

    if (name && name !== user.name) {
      changes.push(`name: ${user.name} → ${name}`)
    }

    if (changes.length === 0) {
      throw new ValidationError('Nenhuma alteração foi fornecida.')
    }

    const updatedUser = await this.usersRepository.update(userId, {
      ...(name && { name }),
      ...(email && { email }),
    })

    logger.logUserUpdate(updatedUser.name, updatedUser.id, changes)

    const { password_hash, password_history, login_attempts, locked_until, ...userWithoutPassword } = updatedUser

    return {
      user: userWithoutPassword,
    }
  }
}
