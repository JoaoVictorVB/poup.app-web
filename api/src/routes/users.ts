import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error'
import { makeAuthenticateUseCase } from '@/use-cases/user/factories/make-authenticate-use-case'
import { makeGetUserProfileUseCase } from '@/use-cases/user/factories/make-get-user-profile-use-case'
import { makeRegisterUseCase } from '@/use-cases/user/factories/make-register-use-case'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { deleteUser } from '../http/controllers/users/delete-user'
import { updatePassword } from '../http/controllers/users/update-password'
import { updateUser } from '../http/controllers/users/update-user'

// Rate limiter específico para autenticação (mais restritivo)
const authRateLimitConfig = {
  max: 5, // Apenas 5 tentativas
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({
    error: 'Too Many Authentication Attempts',
    message: 'Muitas tentativas de login. Tente novamente em 1 minuto.',
    statusCode: 429,
  }),
}

export async function userRoutes(app: FastifyInstance) {
  app.post('/users', async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
      email: z.string().email('Email inválido'),
      password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    })

    const { name, email, password } = createUserSchema.parse(request.body)

    try {
      const registerUseCase = makeRegisterUseCase()
      const { user } = await registerUseCase.execute({ name, email, password })

      return reply.status(201).send({ user })
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return reply.status(409).send({ message: error.message })
      }

      throw error
    }
  })

  app.post('/sessions', {
    config: authRateLimitConfig,
  }, async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(1, 'Senha é obrigatória'),
    })

    const { email, password } = loginSchema.parse(request.body)

    try {
      const authenticateUseCase = makeAuthenticateUseCase()
      const { user } = await authenticateUseCase.execute({ email, password })

      const token = app.jwt.sign(
        {
          sub: user.id,
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: '7d',
        }
      )

      return { token }
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return reply.status(401).send({ message: error.message })
      }

      throw error
    }
  })

  app.get('/me', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const userId = request.user.sub

    try {
      const getUserProfileUseCase = makeGetUserProfileUseCase()
      const { user } = await getUserProfileUseCase.execute({ userId })

      return { user }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      throw error
    }
  })

  app.put('/me', {
    preHandler: [app.authenticate],
  }, updateUser)

  app.put('/me/password', {
    preHandler: [app.authenticate],
  }, updatePassword)

  app.delete('/me', {
    preHandler: [app.authenticate],
  }, deleteUser)
}