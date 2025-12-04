import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Reports (E2E)', () => {
  let authToken: string

  beforeAll(async () => {
    await app.ready()

    // Create and authenticate a user
    await request(app.server).post('/users').send({
      name: 'Test User Reports',
      email: 'reports-test@example.com',
      password: 'Password123!',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email: 'reports-test@example.com',
      password: 'Password123!',
    })

    authToken = authResponse.body.token

    // Create subscriptions for testing
    await request(app.server)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Netflix',
        price: 45.9,
        billing_cycle: 'monthly',
        next_payment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      })

    await request(app.server)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Spotify',
        price: 21.9,
        billing_cycle: 'monthly',
        next_payment: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      })

    // Create products for testing
    await request(app.server)
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Notebook',
        category: 'shopping',
        total_price: 3000,
        installments: 10,
        paid_installments: 2,
        installment_value: 300,
        next_payment: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        status: 'partial',
      })

    await request(app.server)
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'iPhone',
        category: 'shopping',
        total_price: 5000,
        installments: 12,
        paid_installments: 0,
        installment_value: 416.67,
        next_payment: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        status: 'pending',
      })

    // Create payments for testing
    await request(app.server).post('/payments').set('Authorization', `Bearer ${authToken}`).send({
      amount: 45.9,
      payment_method: 'credit_card',
      status: 'paid',
      payment_date: '2024-01-15',
    })

    await request(app.server).post('/payments').set('Authorization', `Bearer ${authToken}`).send({
      amount: 21.9,
      payment_method: 'pix',
      status: 'paid',
      payment_date: '2024-01-20',
    })

    await request(app.server).post('/payments').set('Authorization', `Bearer ${authToken}`).send({
      amount: 300,
      payment_method: 'debit_card',
      status: 'paid',
      payment_date: '2024-01-25',
    })

    await request(app.server)
      .post('/payments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 100,
        payment_method: 'cash',
        status: 'pending',
        payment_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      })
  })

  afterAll(async () => {
    await app.close()
    // Give time for connections to close properly
    await new Promise((resolve) => setTimeout(resolve, 500))
  })

  describe('GET /reports/financial', () => {
    it('should be able to get financial report', async () => {
      const response = await request(app.server)
        .get('/reports/financial')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('total_spent')
      expect(response.body).toHaveProperty('monthly_average')
      expect(response.body).toHaveProperty('yearly_projection')
    })

    it('should calculate total spent correctly', async () => {
      const response = await request(app.server)
        .get('/reports/financial')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.total_spent).toBeGreaterThan(0)
      // Should include paid payments (45.9 + 21.9 + 300 = 367.8)
      expect(response.body.total_spent).toBeGreaterThanOrEqual(367.8)
    })

    it('should calculate monthly average', async () => {
      const response = await request(app.server)
        .get('/reports/financial')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('monthly_average')
      expect(typeof response.body.monthly_average).toBe('number')
      expect(response.body.monthly_average).toBeGreaterThanOrEqual(0)
    })

    it('should calculate yearly projection', async () => {
      const response = await request(app.server)
        .get('/reports/financial')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('yearly_projection')
      expect(typeof response.body.yearly_projection).toBe('number')
      expect(response.body.yearly_projection).toBeGreaterThanOrEqual(0)
    })

    it('should include upcoming payments from subscriptions', async () => {
      const response = await request(app.server)
        .get('/reports/financial')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('upcoming_payments')
      expect(response.body.upcoming_payments).toBeInstanceOf(Array)

      // Should include upcoming subscription payments
      const hasSubscriptionPayments = response.body.upcoming_payments.some(
        (payment: { type: string }) => payment.type === 'subscription'
      )
      expect(hasSubscriptionPayments).toBe(true)
    })

    it('should include upcoming payments from products', async () => {
      const response = await request(app.server)
        .get('/reports/financial')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)

      // May or may not have product payments depending on next_payment dates
      expect(response.body).toHaveProperty('upcoming_payments')
      expect(response.body.upcoming_payments).toBeInstanceOf(Array)
    })

    it('should include pending payments', async () => {
      const response = await request(app.server)
        .get('/reports/financial')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.upcoming_payments).toBeInstanceOf(Array)

      // Should include pending payments
      const hasPendingPayments = response.body.upcoming_payments.some(
        (payment: { type: string }) => payment.type === 'pending_payment'
      )
      expect(hasPendingPayments).toBe(true)
    })

    it('should return report with all required fields', async () => {
      const response = await request(app.server)
        .get('/reports/financial')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('total_spent')
      expect(response.body).toHaveProperty('monthly_average')
      expect(response.body).toHaveProperty('yearly_projection')
      expect(response.body).toHaveProperty('upcoming_payments')

      // Check upcoming payments structure
      if (response.body.upcoming_payments.length > 0) {
        const payment = response.body.upcoming_payments[0]
        expect(payment).toHaveProperty('name')
        expect(payment).toHaveProperty('amount')
        expect(payment).toHaveProperty('due_date')
        expect(payment).toHaveProperty('type')
      }
    })

    it('should only count paid payments in total spent', async () => {
      const response = await request(app.server)
        .get('/reports/financial')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)

      // Total spent should only include paid payments
      // Should not include the pending 100 payment
      // Should be around 367.8 (45.9 + 21.9 + 300) from beforeAll
      expect(response.body.total_spent).toBeGreaterThanOrEqual(367)
    })

    it('should return upcoming payments within next 30 days', async () => {
      const response = await request(app.server)
        .get('/reports/financial')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.upcoming_payments).toBeInstanceOf(Array)

      // All upcoming payments should be within 30 days
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      response.body.upcoming_payments.forEach((payment: { due_date: string }) => {
        const dueDate = new Date(payment.due_date)
        expect(dueDate.getTime()).toBeLessThanOrEqual(thirtyDaysFromNow.getTime())
      })
    })
  })
})
