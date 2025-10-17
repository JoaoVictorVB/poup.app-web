import { PrismaCalendarEventsRepository } from '@/repositories/prisma/PrismaCalendarRepository'
import { FetchAllCalendarEventsUseCase } from '../fetch-all-calendar-events'

export function makeFetchAllCalendarEventsUseCase() {
  const calendarEventsRepository = new PrismaCalendarEventsRepository()
  const useCase = new FetchAllCalendarEventsUseCase(calendarEventsRepository)

  return useCase
}
