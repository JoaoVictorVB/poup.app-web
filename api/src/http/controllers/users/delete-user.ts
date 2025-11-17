import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { InvalidCredentialsError } from '../../../use-cases/errors/invalid-credentials-error'
import { ResourceNotFoundError } from '../../../use-cases/errors/resource-not-found-error'
import { makeDeleteUserUseCase } from '../../../use-cases/user/factories/make-delete-user-use-case'

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  const deleteUserBodySchema = z.object({
    password: z.string(),
  })

  const { password } = deleteUserBodySchema.parse(request.body)

  try {
    const deleteUserUseCase = makeDeleteUserUseCase()

    await deleteUserUseCase.execute({
      userId: request.user.sub,
      password,
    })

    return reply.status(200).send({
      message: 'Conta excluída com sucesso',
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof InvalidCredentialsError) {
      return reply.status(401).send({ message: err.message })
    }

    throw err
  }
}
