import { CalendarEventsRepository } from '@/repositories/ICalendarRepository'
import { CalendarEvent } from '@prisma/client'

interface FetchAllCalendarEventsUseCaseResponse {
  events: CalendarEvent[]
}

export class FetchAllCalendarEventsUseCase {
  constructor(private calendarEventsRepository: CalendarEventsRepository) {}

  async execute(): Promise<FetchAllCalendarEventsUseCaseResponse> {
    const events = await this.calendarEventsRepository.findAll()

    return {
      events,
    }
  }
}
