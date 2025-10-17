import { makeCreateCalendarEventUseCase } from '@/use-cases/calendar/factories/make-create-calendar-event-use-case'
import { ValidationError } from '@/use-cases/errors/validation-error'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createEventBodySchema = z.object({
    title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
    date: z.string().datetime('Data inválida'),
    type: z.enum(['payment', 'reminder'], {
      errorMap: () => ({ message: 'Tipo deve ser "payment" ou "reminder"' }),
    }),
  })

  const { title, date, type } = createEventBodySchema.parse(request.body)

  try {
    const createCalendarEventUseCase = makeCreateCalendarEventUseCase()
    const { event } = await createCalendarEventUseCase.execute({
      title,
      date: new Date(date),
      type,
    })

    return reply.status(201).send({ event })
  } catch (error) {
    if (error instanceof ValidationError) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}
