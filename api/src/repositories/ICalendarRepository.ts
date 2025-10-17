import { CalendarEvent } from '@prisma/client'

export interface CreateCalendarEventDTO {
  title: string
  date: Date
  type: 'payment' | 'reminder'
}

export interface UpdateCalendarEventDTO {
  title?: string
  date?: Date
  type?: 'payment' | 'reminder'
}

export interface FindCalendarEventQuery {
  id?: string
}

export interface CalendarEventsRepository {
  findAll(): Promise<CalendarEvent[]>
  findUnique(query: FindCalendarEventQuery): Promise<CalendarEvent | null>
  create(data: CreateCalendarEventDTO): Promise<CalendarEvent>
  update(id: string, data: UpdateCalendarEventDTO): Promise<CalendarEvent>
  delete(id: string): Promise<void>
}
