import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Subscriptions (E2E)', () => {
  let authToken: string
  let _userId: string

  beforeAll(async () => {
    await app.ready()

    // Create test user
    const registerResponse = await request(app.server).post('/users').send({
      name: 'Test User',
      email: 'subscription-test@example.com',
      password: 'Password123!',
    })

    _userId = registerResponse.body.user.id

    // Authenticate
    const authResponse = await request(app.server).post('/sessions').send({
      email: 'subscription-test@example.com',
      password: 'Password123!',
    })

    authToken = authResponse.body.token
  })

  afterAll(async () => {
    await app.close()
    // Give time for connections to close properly
    await new Promise((resolve) => setTimeout(resolve, 500))
  })

  describe('POST /subscriptions', () => {
    it('should create a new subscription with valid data', async () => {
      const response = await request(app.server)
        .post('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Netflix',
          price: 45.9,
          billing_cycle: 'monthly',
          next_payment: new Date('2025-12-01').toISOString(),
        })

      expect(response.status).toBe(201)
      expect(response.body.subscription).toHaveProperty('id')
      expect(response.body.subscription.name).toBe('Netflix')
      expect(response.body.subscription.price).toBe(45.9)
    })

    it('should create yearly subscription', async () => {
      const response = await request(app.server)
        .post('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Amazon Prime',
          price: 240.0,
          billing_cycle: 'yearly',
          next_payment: new Date('2026-01-01').toISOString(),
        })

      expect(response.status).toBe(201)
      expect(response.body.subscription.billing_cycle).toBe('yearly')
    })
  })

  describe('GET /subscriptions', () => {
    it('should list all user subscriptions', async () => {
      const response = await request(app.server)
        .get('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.subscriptions).toBeInstanceOf(Array)
      expect(response.body.subscriptions.length).toBeGreaterThan(0)
    })
  })

  describe('DELETE /subscriptions/:id', () => {
    it('should delete own subscription', async () => {
      // Create subscription
      const createResponse = await request(app.server)
        .post('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'To Delete',
          price: 9.9,
          billing_cycle: 'monthly',
          next_payment: new Date('2025-12-01').toISOString(),
        })

      const subscriptionId = createResponse.body.subscription.id

      const response = await request(app.server)
        .delete(`/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(204)

      // Verify it's deleted
      const listResponse = await request(app.server)
        .get('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)

      const stillExists = listResponse.body.subscriptions.some(
        (sub: { id: string }) => sub.id === subscriptionId
      )

      expect(stillExists).toBe(false)
    })
  })
})
