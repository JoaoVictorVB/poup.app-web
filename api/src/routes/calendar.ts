import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { NotFoundError, ValidationError } from '../lib/errors'
import { prisma } from '../lib/prisma'

export async function calendarRoutes(app: FastifyInstance) {
  app.get('/calendar', {
    preHandler: [app.authenticate],
  }, async () => {
    const events = await prisma.calendarEvent.findMany({
      orderBy: { date: 'asc' },
    })

    return { events }
  })

  app.post('/calendar', {
    preHandler: [app.authenticate],
  }, async (request) => {
    const createEventSchema = z.object({
      title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
      date: z.string().datetime('Data inválida'),
      type: z.enum(['payment', 'reminder'], {
        errorMap: () => ({ message: 'Tipo deve ser "payment" ou "reminder"' }),
      }),
    })

    const { title, date, type } = createEventSchema.parse(request.body)

    const eventDate = new Date(date)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    if (eventDate < oneYearAgo) {
      throw new ValidationError('A data do evento não pode ser há mais de 1 ano')
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        date: eventDate,
        type,
      },
    })

    return { event }
  })

  app.put('/calendar/:id', {
    preHandler: [app.authenticate],
  }, async (request) => {
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

    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      throw new NotFoundError('Evento não encontrado')
    }

    if (data.date) {
      const eventDate = new Date(data.date)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      if (eventDate < oneYearAgo) {
        throw new ValidationError('A data do evento não pode ser há mais de 1 ano')
      }
    }

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    })

    return { event }
  })

  app.delete('/calendar/:id', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid('ID inválido'),
    })

    const { id } = paramsSchema.parse(request.params)

    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      throw new NotFoundError('Evento não encontrado')
    }

    await prisma.calendarEvent.delete({
      where: { id },
    })

    return reply.status(204).send()
  })
}