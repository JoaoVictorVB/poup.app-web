import { UsersRepository } from '@/repositories/IUserRepository'
import { compare } from 'bcryptjs'
import { logger } from '../../lib/logger'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface DeleteUserUseCaseRequest {
  userId: string
  password: string
}

interface DeleteUserUseCaseResponse {
  success: boolean
}

export class DeleteUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    password,
  }: DeleteUserUseCaseRequest): Promise<DeleteUserUseCaseResponse> {
    const user = await this.usersRepository.findUnique({ id: userId })

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const passwordMatches = await compare(password, user.password_hash)

    if (!passwordMatches) {
      logger.logAuthenticationFailure(user.email, 'Senha incorreta na tentativa de exclusão de conta')
      throw new InvalidCredentialsError('Senha incorreta')
    }

    logger.logUserDeletion(user.name, user.id, user.email)

    await this.usersRepository.delete(userId)

    return {
      success: true,
    }
  }
}
