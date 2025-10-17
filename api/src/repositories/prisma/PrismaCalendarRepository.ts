import { CalendarEvent } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import {
  CalendarEventsRepository,
  CreateCalendarEventDTO,
  FindCalendarEventQuery,
  UpdateCalendarEventDTO
} from '../ICalendarRepository'

export class PrismaCalendarEventsRepository implements CalendarEventsRepository {
  async findAll(): Promise<CalendarEvent[]> {
    return prisma.calendarEvent.findMany({
      orderBy: { date: 'asc' },
    })
  }

  async findUnique(query: FindCalendarEventQuery): Promise<CalendarEvent | null> {
    return prisma.calendarEvent.findUnique({
      where: { id: query.id },
    })
  }

  async create(data: CreateCalendarEventDTO): Promise<CalendarEvent> {
    return prisma.calendarEvent.create({
      data,
    })
  }

  async update(id: string, data: UpdateCalendarEventDTO): Promise<CalendarEvent> {
    return prisma.calendarEvent.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.calendarEvent.delete({
      where: { id },
    })
  }
}
