import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error'
import { makeAuthenticateUseCase } from '@/use-cases/user/factories/make-authenticate-use-case'
import { makeGetUserProfileUseCase } from '@/use-cases/user/factories/make-get-user-profile-use-case'
import { makeRegisterUseCase } from '@/use-cases/user/factories/make-register-use-case'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

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

  app.post('/sessions', async (request, reply) => {
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
          id: user.id,
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
    const { id: userId } = request.user as { id: string, name: string, email: string }

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
}