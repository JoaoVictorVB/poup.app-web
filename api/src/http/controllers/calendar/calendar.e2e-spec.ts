import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Calendar (E2E)', () => {
  let authToken: string

  beforeAll(async () => {
    await app.ready()

    await request(app.server).post('/users').send({
      name: 'Calendar User',
      email: 'calendar@example.com',
      password: 'Password123!',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email: 'calendar@example.com',
      password: 'Password123!',
    })

    authToken = authResponse.body.token
  })

  afterAll(async () => {
    await app.close()
    // Give time for connections to close properly
    await new Promise((resolve) => setTimeout(resolve, 500))
  })

  describe('POST /calendar', () => {
    it('should create a new calendar event', async () => {
      const response = await request(app.server)
        .post('/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Netflix Payment',
          date: new Date('2025-12-01').toISOString(),
          type: 'payment',
        })

      expect(response.status).toBe(201)
      expect(response.body.event).toHaveProperty('id')
      expect(response.body.event.title).toBe('Netflix Payment')
      expect(response.body.event.type).toBe('payment')
    })

    it('should create reminder event', async () => {
      const response = await request(app.server)
        .post('/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Check subscriptions',
          date: new Date('2025-12-15').toISOString(),
          type: 'reminder',
        })

      expect(response.status).toBe(201)
      expect(response.body.event.type).toBe('reminder')
    })
  })

  describe('GET /calendar', () => {
    it('should list all calendar events', async () => {
      const response = await request(app.server)
        .get('/calendar')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.events).toBeInstanceOf(Array)
    })
  })

  describe('PUT /calendar/:id', () => {
    it('should update calendar event', async () => {
      const createResponse = await request(app.server)
        .post('/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'To Update',
          date: new Date('2025-12-01').toISOString(),
          type: 'payment',
        })

      const eventId = createResponse.body.event.id

      const response = await request(app.server)
        .put(`/calendar/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Event',
        })

      expect(response.status).toBe(200)
      expect(response.body.event.title).toBe('Updated Event')
    })
  })

  describe('DELETE /calendar/:id', () => {
    it('should delete calendar event', async () => {
      const createResponse = await request(app.server)
        .post('/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'To Delete',
          date: new Date('2025-12-01').toISOString(),
          type: 'payment',
        })

      const eventId = createResponse.body.event.id

      const response = await request(app.server)
        .delete(`/calendar/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(204)

      const listResponse = await request(app.server)
        .get('/calendar')
        .set('Authorization', `Bearer ${authToken}`)

      const stillExists = listResponse.body.events.some(
        (event: { id: string }) => event.id === eventId
      )

      expect(stillExists).toBe(false)
    })
  })
})
