import { CalendarEventsRepository } from '@/repositories/ICalendarRepository'
import { CalendarEvent } from '@prisma/client'
import { ValidationError } from '../errors/validation-error'

interface CreateCalendarEventUseCaseRequest {
  title: string
  date: Date
  type: 'payment' | 'reminder'
}

interface CreateCalendarEventUseCaseResponse {
  event: CalendarEvent
}

export class CreateCalendarEventUseCase {
  constructor(private calendarEventsRepository: CalendarEventsRepository) {}

  async execute(
    data: CreateCalendarEventUseCaseRequest
  ): Promise<CreateCalendarEventUseCaseResponse> {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    if (data.date < oneYearAgo) {
      throw new ValidationError('A data do evento não pode ser há mais de 1 ano')
    }

    const event = await this.calendarEventsRepository.create(data)

    return {
      event,
    }
  }
}
