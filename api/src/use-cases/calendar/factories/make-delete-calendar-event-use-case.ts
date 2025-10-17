import { PrismaCalendarEventsRepository } from '@/repositories/prisma/PrismaCalendarRepository'
import { DeleteCalendarEventUseCase } from '../delete-calendar-event'

export function makeDeleteCalendarEventUseCase() {
  const calendarEventsRepository = new PrismaCalendarEventsRepository()
  const useCase = new DeleteCalendarEventUseCase(calendarEventsRepository)

  return useCase
}
