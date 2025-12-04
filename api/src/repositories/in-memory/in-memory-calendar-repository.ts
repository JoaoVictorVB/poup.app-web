import { CalendarEvent } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import {
  CalendarEventsRepository,
  CreateCalendarEventDTO,
  FindCalendarEventQuery,
  UpdateCalendarEventDTO,
} from '../ICalendarRepository'

export class InMemoryCalendarRepository implements CalendarEventsRepository {
  public items: CalendarEvent[] = []

  async findAll(): Promise<CalendarEvent[]> {
    return this.items
  }

  async findUnique(query: FindCalendarEventQuery): Promise<CalendarEvent | null> {
    if (query.id) {
      const event = this.items.find((item) => item.id === query.id)
      return event || null
    }

    return null
  }

  async create(data: CreateCalendarEventDTO): Promise<CalendarEvent> {
    const event: CalendarEvent = {
      id: randomUUID(),
      title: data.title,
      date: data.date,
      type: data.type,
      created_at: new Date(),
    }

    this.items.push(event)

    return event
  }

  async update(id: string, data: UpdateCalendarEventDTO): Promise<CalendarEvent> {
    const eventIndex = this.items.findIndex((item) => item.id === id)

    if (eventIndex === -1) {
      throw new Error('Event not found')
    }

    const updatedEvent = {
      ...this.items[eventIndex],
      ...data,
    }

    this.items[eventIndex] = updatedEvent

    return updatedEvent
  }

  async delete(id: string): Promise<void> {
    const eventIndex = this.items.findIndex((item) => item.id === id)

    if (eventIndex !== -1) {
      this.items.splice(eventIndex, 1)
    }
  }
}
