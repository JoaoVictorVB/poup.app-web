import { PrismaCalendarEventsRepository } from '@/repositories/prisma/PrismaCalendarRepository'
import { UpdateCalendarEventUseCase } from '../update-calendar-event'

export function makeUpdateCalendarEventUseCase() {
  const calendarEventsRepository = new PrismaCalendarEventsRepository()
  const useCase = new UpdateCalendarEventUseCase(calendarEventsRepository)

  return useCase
}
