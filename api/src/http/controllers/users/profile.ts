import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error';
import { makeGetUserProfileUseCase } from '@/use-cases/user/factories/make-get-user-profile-use-case';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function profile(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub

  try {
    const getUserProfileUseCase = makeGetUserProfileUseCase()
    const { user } = await getUserProfileUseCase.execute({ userId })

    return reply.status(200).send({ user })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
