import { UsersRepository } from '@/repositories/IUserRepository'
import { User } from '@prisma/client'
import { compare } from 'bcryptjs'
import { logger } from '../../lib/logger'
import { AccountLockedError } from '../errors/account-locked-error'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { ValidationError } from '../errors/validation-error'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  user: Omit<User, 'password_hash' | 'password_history' | 'login_attempts' | 'locked_until'>
}

export class AuthenticateUseCase {
  private readonly MAX_LOGIN_ATTEMPTS = 5
  private readonly LOCK_DURATION_MINUTES = 10

  constructor(private usersRepository: UsersRepository) {}

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isAccountLocked(lockedUntil: Date | null): boolean {
    if (!lockedUntil) return false
    return new Date() < lockedUntil
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const newAttempts = user.login_attempts + 1
    
    if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + this.LOCK_DURATION_MINUTES * 60 * 1000)
      
      await this.usersRepository.update(user.id, {
        login_attempts: newAttempts,
        locked_until: lockedUntil,
      })
      
      logger.logAccountLocked(user.name, user.id, lockedUntil)
      
      throw new AccountLockedError(lockedUntil)
    } else {
      await this.usersRepository.update(user.id, {
        login_attempts: newAttempts,
      })
      
      logger.logAuthenticationFailure(user.email, `Tentativa ${newAttempts} de ${this.MAX_LOGIN_ATTEMPTS}`)
      
      const remainingAttempts = this.MAX_LOGIN_ATTEMPTS - newAttempts
      throw new InvalidCredentialsError(
        `Credenciais inválidas. ${remainingAttempts} tentativa(s) restante(s).`
      )
    }
  }

  private async resetLoginAttempts(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      login_attempts: 0,
      locked_until: null,
    })
  }

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    if (!this.validateEmail(email)) {
      throw new ValidationError('Email inválido. Por favor, insira um email válido.')
    }

    if (!password || password.trim() === '') {
      throw new ValidationError('Senha é obrigatória.')
    }

    const user = await this.usersRepository.findUnique({ email })

    if (!user) {
      logger.logAuthenticationFailure(email, 'Usuário não encontrado')
      throw new InvalidCredentialsError()
    }

    if (this.isAccountLocked(user.locked_until)) {
      throw new AccountLockedError(user.locked_until!)
    }

    const passwordMatches = await compare(password, user.password_hash)

    if (!passwordMatches) {
      await this.handleFailedLogin(user)
      throw new InvalidCredentialsError()
    }

    await this.resetLoginAttempts(user.id)

    logger.logAuthenticationSuccess(user.name, user.id)

    const { password_hash, password_history, login_attempts, locked_until, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
    }
  }
}
