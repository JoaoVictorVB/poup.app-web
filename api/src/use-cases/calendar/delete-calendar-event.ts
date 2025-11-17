import { CalendarEventsRepository } from '@/repositories/ICalendarRepository'
import { logger } from '../../lib/logger'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface DeleteCalendarEventUseCaseRequest {
  eventId: string
}

export class DeleteCalendarEventUseCase {
  constructor(private calendarEventsRepository: CalendarEventsRepository) {}

  async execute({ eventId }: DeleteCalendarEventUseCaseRequest): Promise<void> {
    const existingEvent = await this.calendarEventsRepository.findUnique({
      id: eventId,
    })

    if (!existingEvent) {
      throw new ResourceNotFoundError('Event')
    }

    logger.logCalendarEventDeleted(existingEvent.title)

    await this.calendarEventsRepository.delete(eventId)
  }
}
