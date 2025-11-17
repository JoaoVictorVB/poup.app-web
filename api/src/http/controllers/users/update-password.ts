import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { InvalidCredentialsError } from '../../../use-cases/errors/invalid-credentials-error'
import { ResourceNotFoundError } from '../../../use-cases/errors/resource-not-found-error'
import { ValidationError } from '../../../use-cases/errors/validation-error'
import { makeUpdatePasswordUseCase } from '../../../use-cases/user/factories/make-update-password-use-case'

export async function updatePassword(request: FastifyRequest, reply: FastifyReply) {
  const updatePasswordBodySchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(10),
  })

  const { currentPassword, newPassword } = updatePasswordBodySchema.parse(request.body)

  try {
    const updatePasswordUseCase = makeUpdatePasswordUseCase()

    await updatePasswordUseCase.execute({
      userId: request.user.sub,
      currentPassword,
      newPassword,
    })

    return reply.status(200).send({
      message: 'Senha atualizada com sucesso',
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof InvalidCredentialsError) {
      return reply.status(401).send({ message: err.message })
    }

    if (err instanceof ValidationError) {
      return reply.status(400).send({
        message: err.message,
        errors: [{ field: 'newPassword', message: err.message }],
      })
    }

    throw err
  }
}
