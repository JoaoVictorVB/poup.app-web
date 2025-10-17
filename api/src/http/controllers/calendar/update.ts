import { makeUpdateCalendarEventUseCase } from '@/use-cases/calendar/factories/make-update-calendar-event-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { ValidationError } from '@/use-cases/errors/validation-error'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateEventParamsSchema = z.object({
    id: z.string().uuid('ID inválido'),
  })

  const updateEventBodySchema = z.object({
    title: z.string().min(1, 'Título não pode ser vazio').max(100, 'Título muito longo').optional(),
    date: z.string().datetime('Data inválida').optional(),
    type: z
      .enum(['payment', 'reminder'], {
        errorMap: () => ({ message: 'Tipo deve ser "payment" ou "reminder"' }),
      })
      .optional(),
  })

  const { id } = updateEventParamsSchema.parse(request.params)
  const data = updateEventBodySchema.parse(request.body)

  try {
    const updateCalendarEventUseCase = makeUpdateCalendarEventUseCase()
    const { event } = await updateCalendarEventUseCase.execute({
      eventId: id,
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    })

    return reply.status(200).send({ event })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    if (error instanceof ValidationError) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}
