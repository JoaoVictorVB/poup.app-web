import { AccountLockedError } from '@/use-cases/errors/account-locked-error'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { ValidationError } from '@/use-cases/errors/validation-error'
import { makeAuthenticateUseCase } from '@/use-cases/user/factories/make-authenticate-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authenticateBodySchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
  })

  try {
    const { email, password } = authenticateBodySchema.parse(request.body)

    const authenticateUseCase = makeAuthenticateUseCase()
    const { user } = await authenticateUseCase.execute({ email, password })

    const token = await reply.jwtSign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      {
        expiresIn: '30m', // Token expira em 30 minutos
      }
    )

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutos a partir de agora

    return reply.status(200).send({ 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      expiresAt,
      message: 'Login realizado com sucesso!'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ 
        message: 'Dados inválidos',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    if (error instanceof ValidationError) {
      return reply.status(400).send({ message: error.message })
    }

    if (error instanceof AccountLockedError) {
      return reply.status(423).send({ message: error.message }) // 423 Locked
    }

    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({ message: error.message })
    }

    throw error
  }
}
