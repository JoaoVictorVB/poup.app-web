import { makeDeleteCalendarEventUseCase } from '@/use-cases/calendar/factories/make-delete-calendar-event-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteEventParamsSchema = z.object({
    id: z.string().uuid('ID inválido'),
  })

  const { id } = deleteEventParamsSchema.parse(request.params)

  try {
    const deleteCalendarEventUseCase = makeDeleteCalendarEventUseCase()
    await deleteCalendarEventUseCase.execute({ eventId: id })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
