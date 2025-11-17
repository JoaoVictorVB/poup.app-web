import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { ResourceNotFoundError } from '../../../use-cases/errors/resource-not-found-error'
import { UserAlreadyExistsError } from '../../../use-cases/errors/user-already-exists-error'
import { ValidationError } from '../../../use-cases/errors/validation-error'
import { makeUpdateUserUseCase } from '../../../use-cases/user/factories/make-update-user-use-case'

export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
  const updateUserBodySchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  })

  const { name, email } = updateUserBodySchema.parse(request.body)

  try {
    const updateUserUseCase = makeUpdateUserUseCase()

    const { user } = await updateUserUseCase.execute({
      userId: request.user.sub,
      name,
      email,
    })

    return reply.status(200).send({
      user,
      message: 'Dados atualizados com sucesso',
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    if (err instanceof ValidationError) {
      return reply.status(400).send({
        message: err.message,
        errors: [{ field: 'general', message: err.message }],
      })
    }

    throw err
  }
}
