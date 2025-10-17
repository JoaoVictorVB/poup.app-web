import { makeCreateCalendarEventUseCase } from '@/use-cases/calendar/factories/make-create-calendar-event-use-case'
import { makeDeleteCalendarEventUseCase } from '@/use-cases/calendar/factories/make-delete-calendar-event-use-case'
import { makeFetchAllCalendarEventsUseCase } from '@/use-cases/calendar/factories/make-fetch-all-calendar-events-use-case'
import { makeUpdateCalendarEventUseCase } from '@/use-cases/calendar/factories/make-update-calendar-event-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { ValidationError } from '@/use-cases/errors/validation-error'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function calendarRoutes(app: FastifyInstance) {
  app.get('/calendar', {
    preHandler: [app.authenticate],
  }, async () => {
    const fetchAllCalendarEventsUseCase = makeFetchAllCalendarEventsUseCase()
    const { events } = await fetchAllCalendarEventsUseCase.execute()

    return { events }
  })

  app.post('/calendar', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const createEventSchema = z.object({
      title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
      date: z.string().datetime('Data inválida'),
      type: z.enum(['payment', 'reminder'], {
        errorMap: () => ({ message: 'Tipo deve ser "payment" ou "reminder"' }),
      }),
    })

    const { title, date, type } = createEventSchema.parse(request.body)

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
  })

  app.put('/calendar/:id', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid('ID inválido'),
    })

    const { id } = paramsSchema.parse(request.params)

    const updateEventSchema = z.object({
      title: z.string().min(1, 'Título não pode ser vazio').max(100, 'Título muito longo').optional(),
      date: z.string().datetime('Data inválida').optional(),
      type: z.enum(['payment', 'reminder'], {
        errorMap: () => ({ message: 'Tipo deve ser "payment" ou "reminder"' }),
      }).optional(),
    })

    const data = updateEventSchema.parse(request.body)

    try {
      const updateCalendarEventUseCase = makeUpdateCalendarEventUseCase()
      const { event } = await updateCalendarEventUseCase.execute({
        eventId: id,
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        },
      })

      return { event }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }
      if (error instanceof ValidationError) {
        return reply.status(400).send({ message: error.message })
      }

      throw error
    }
  })

  app.delete('/calendar/:id', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid('ID inválido'),
    })

    const { id } = paramsSchema.parse(request.params)

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
  })
}