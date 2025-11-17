import { UsersRepository } from '@/repositories/IUserRepository'
import { compare, hash } from 'bcryptjs'
import { logger } from '../../lib/logger'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { ValidationError } from '../errors/validation-error'

interface UpdatePasswordUseCaseRequest {
  userId: string
  currentPassword: string
  newPassword: string
}

interface UpdatePasswordUseCaseResponse {
  success: boolean
}

export class UpdatePasswordUseCase {
  constructor(private usersRepository: UsersRepository) {}

  private validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 10) {
      return { valid: false, message: 'A senha deve ter no mínimo 10 caracteres' }
    }

    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' }
    }

    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'A senha deve conter pelo menos uma letra minúscula' }
    }

    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'A senha deve conter pelo menos um número' }
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return {
        valid: false,
        message: 'A senha deve conter pelo menos um caractere especial (!@#$%^&*...)',
      }
    }

    return { valid: true }
  }

  private async checkPasswordHistory(
    password: string,
    passwordHistory: string | null
  ): Promise<boolean> {
    if (!passwordHistory) {
      return true
    }

    try {
      const historyHashes: string[] = JSON.parse(passwordHistory)

      for (const oldHash of historyHashes) {
        const isMatch = await compare(password, oldHash)
        if (isMatch) {
          return false
        }
      }

      return true
    } catch {
      return true
    }
  }

  private async updatePasswordHistory(
    newPasswordHash: string,
    oldHistory: string | null
  ): Promise<string> {
    let historyArray: string[] = []

    if (oldHistory) {
      try {
        historyArray = JSON.parse(oldHistory)
      } catch {
        historyArray = []
      }
    }

    historyArray.unshift(newPasswordHash)

    if (historyArray.length > 3) {
      historyArray = historyArray.slice(0, 3)
    }

    return JSON.stringify(historyArray)
  }

  async execute({
    userId,
    currentPassword,
    newPassword,
  }: UpdatePasswordUseCaseRequest): Promise<UpdatePasswordUseCaseResponse> {
    const user = await this.usersRepository.findUnique({ id: userId })

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const currentPasswordMatches = await compare(currentPassword, user.password_hash)

    if (!currentPasswordMatches) {
      logger.logAuthenticationFailure(user.email, 'Senha atual incorreta na tentativa de alteração')
      throw new InvalidCredentialsError('Senha atual incorreta')
    }

    const passwordValidation = this.validatePassword(newPassword)
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.message!)
    }

    const canUsePassword = await this.checkPasswordHistory(newPassword, user.password_history)

    if (!canUsePassword) {
      throw new ValidationError(
        'Esta senha já foi utilizada recentemente. Por favor, escolha uma senha diferente.'
      )
    }

    const newPasswordHash = await hash(newPassword, 8)
    const updatedPasswordHistory = await this.updatePasswordHistory(
      newPasswordHash,
      user.password_history
    )

    await this.usersRepository.update(userId, {
      password_hash: newPasswordHash,
      password_history: updatedPasswordHistory,
    })

    logger.logPasswordChange(user.name, user.id)

    return {
      success: true,
    }
  }
}
