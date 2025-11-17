import { CalendarEventsRepository, UpdateCalendarEventDTO } from '@/repositories/ICalendarRepository'
import { CalendarEvent } from '@prisma/client'
import { logger } from '../../lib/logger'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { ValidationError } from '../errors/validation-error'

interface UpdateCalendarEventUseCaseRequest {
  eventId: string
  data: UpdateCalendarEventDTO
}

interface UpdateCalendarEventUseCaseResponse {
  event: CalendarEvent
}

export class UpdateCalendarEventUseCase {
  constructor(private calendarEventsRepository: CalendarEventsRepository) {}

  async execute({
    eventId,
    data,
  }: UpdateCalendarEventUseCaseRequest): Promise<UpdateCalendarEventUseCaseResponse> {
    const existingEvent = await this.calendarEventsRepository.findUnique({
      id: eventId,
    })

    if (!existingEvent) {
      throw new ResourceNotFoundError('Event')
    }

    if (data.date) {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      if (data.date < oneYearAgo) {
        throw new ValidationError('A data do evento não pode ser há mais de 1 ano')
      }
    }

    const event = await this.calendarEventsRepository.update(eventId, data)

    const changes: string[] = []
    if (data.title) changes.push('title')
    if (data.date) changes.push('date')
    if (data.type) changes.push('type')
    logger.logCalendarEventUpdated(event.title, changes)

    return {
      event,
    }
  }
}
