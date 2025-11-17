import { UsersRepository } from '@/repositories/IUserRepository'
import { User } from '@prisma/client'
import { compare, hash } from 'bcryptjs'
import { logger } from '../../lib/logger'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { ValidationError } from '../errors/validation-error'

interface RegisterUseCaseRequest {
  name: string
  email: string
  password: string
}

interface RegisterUseCaseResponse {
  user: Omit<User, 'password_hash' | 'password_history' | 'login_attempts' | 'locked_until'>
}

export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

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
    name,
    email,
    password,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    if (!this.validateEmail(email)) {
      throw new ValidationError('Email inválido. Por favor, insira um email válido.')
    }

    const passwordValidation = this.validatePassword(password)
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.message!)
    }

    const userExists = await this.usersRepository.findUnique({ email })

    if (userExists) {
      throw new UserAlreadyExistsError()
    }

    const password_hash = await hash(password, 8)

    const password_history = await this.updatePasswordHistory(password_hash, null)

    const user = await this.usersRepository.create({
      name,
      email,
      password_hash,
      password_history,
      login_attempts: 0,
      locked_until: null,
    })

    logger.logUserRegistration(user.name, user.id, user.email)

    const {
      password_hash: _,
      password_history: __,
      login_attempts: ___,
      locked_until: ____,
      ...userWithoutPassword
    } = user

    return {
      user: userWithoutPassword,
    }
  }
}
