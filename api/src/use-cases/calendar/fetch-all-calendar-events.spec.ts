import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryCalendarRepository } from '../../repositories/in-memory/in-memory-calendar-repository'
import { FetchAllCalendarEventsUseCase } from './fetch-all-calendar-events'

describe('Fetch All Calendar Events Use Case', () => {
  let calendarRepository: InMemoryCalendarRepository
  let sut: FetchAllCalendarEventsUseCase

  beforeEach(() => {
    calendarRepository = new InMemoryCalendarRepository()
    sut = new FetchAllCalendarEventsUseCase(calendarRepository)
  })

  it('should be able to fetch all calendar events', async () => {
    await calendarRepository.create({
      title: 'Event 1',
      date: new Date('2025-12-01'),
      type: 'payment',
    })

    await calendarRepository.create({
      title: 'Event 2',
      date: new Date('2025-12-15'),
      type: 'reminder',
    })

    const { events } = await sut.execute()

    expect(events).toHaveLength(2)
  })

  it('should return empty array if no events', async () => {
    const { events } = await sut.execute()

    expect(events).toHaveLength(0)
    expect(events).toEqual([])
  })
})
