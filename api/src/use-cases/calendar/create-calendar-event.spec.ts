import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryCalendarRepository } from '../../repositories/in-memory/in-memory-calendar-repository'
import { ValidationError } from '../errors/validation-error'
import { CreateCalendarEventUseCase } from './create-calendar-event'

describe('Create Calendar Event Use Case', () => {
  let calendarRepository: InMemoryCalendarRepository
  let sut: CreateCalendarEventUseCase

  beforeEach(() => {
    calendarRepository = new InMemoryCalendarRepository()
    sut = new CreateCalendarEventUseCase(calendarRepository)
  })

  it('should be able to create a payment event', async () => {
    const { event } = await sut.execute({
      title: 'Netflix Payment',
      date: new Date('2025-12-01'),
      type: 'payment',
    })

    expect(event.id).toBeTruthy()
    expect(event.title).toBe('Netflix Payment')
    expect(event.type).toBe('payment')
  })

  it('should be able to create a reminder event', async () => {
    const { event } = await sut.execute({
      title: 'Check subscriptions',
      date: new Date('2025-12-15'),
      type: 'reminder',
    })

    expect(event.type).toBe('reminder')
  })

  it('should not create event with date older than 1 year', async () => {
    const oldDate = new Date()
    oldDate.setFullYear(oldDate.getFullYear() - 2)

    await expect(() =>
      sut.execute({
        title: 'Old Event',
        date: oldDate,
        type: 'payment',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })
})
