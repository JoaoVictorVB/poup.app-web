import { PrismaCalendarEventsRepository } from '@/repositories/prisma/PrismaCalendarRepository'
import { CreateCalendarEventUseCase } from '../create-calendar-event'

export function makeCreateCalendarEventUseCase() {
  const calendarEventsRepository = new PrismaCalendarEventsRepository()
  const useCase = new CreateCalendarEventUseCase(calendarEventsRepository)

  return useCase
}
