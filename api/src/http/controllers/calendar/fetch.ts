import { makeFetchAllCalendarEventsUseCase } from '@/use-cases/calendar/factories/make-fetch-all-calendar-events-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function fetch(request: FastifyRequest, reply: FastifyReply) {
  const fetchAllCalendarEventsUseCase = makeFetchAllCalendarEventsUseCase()
  const { events } = await fetchAllCalendarEventsUseCase.execute()

  return reply.status(200).send({ events })
}
