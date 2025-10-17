import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error'
import { ValidationError } from '@/use-cases/errors/validation-error'
import { makeRegisterUseCase } from '@/use-cases/user/factories/make-register-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(10, 'Senha deve ter no mínimo 10 caracteres'),
  })

  try {
    const { name, email, password } = registerBodySchema.parse(request.body)

    const registerUseCase = makeRegisterUseCase()
    const { user } = await registerUseCase.execute({ name, email, password })

    return reply.status(201).send({ 
      user,
      message: 'Usuário registrado com sucesso!' 
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

    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}
