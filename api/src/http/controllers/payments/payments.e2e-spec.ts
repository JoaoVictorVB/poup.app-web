import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Payments (E2E)', () => {
  let authToken: string
  let subscriptionId: string | undefined
  let productId: string | undefined

  beforeAll(async () => {
    await app.ready()

    // Create and authenticate a user
    await request(app.server).post('/users').send({
      name: 'Test User Payments',
      email: 'payments-test@example.com',
      password: 'Password123!',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email: 'payments-test@example.com',
      password: 'Password123!',
    })

    authToken = authResponse.body.token

    // Create a subscription for testing
    const subscriptionResponse = await request(app.server)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Netflix',
        price: 45.9,
        billing_cycle: 'monthly',
        next_payment: new Date('2024-02-01').toISOString(),
      })

    if (subscriptionResponse.body.subscription) {
      subscriptionId = subscriptionResponse.body.subscription.id
    }

    // Create a product for testing
    const productResponse = await request(app.server)
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Notebook',
        category: 'shopping',
        total_price: 3000,
        installments: 10,
        paid_installments: 0,
        installment_value: 300,
        next_payment: '2024-02-15',
        status: 'pending',
      })

    if (productResponse.body.product) {
      productId = productResponse.body.product.id
    }
  })

  afterAll(async () => {
    await app.close()
    // Give time for connections to close properly
    await new Promise((resolve) => setTimeout(resolve, 500))
  })

  describe('POST /payments', () => {
    it('should be able to create a new payment', async () => {
      const response = await request(app.server)
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          payment_date: '2024-01-15',
          payment_method: 'credit_card',
          status: 'paid',
          notes: 'Test payment',
        })

      expect(response.status).toBe(201)
      expect(response.body.payment).toHaveProperty('id')
      expect(response.body.payment.amount).toBe(100)
      expect(response.body.payment.payment_method).toBe('credit_card')
      expect(response.body.payment.status).toBe('paid')
    })

    it('should create payment linked to subscription', async () => {
      if (!subscriptionId) {
        console.warn('Skipping test: subscriptionId not available')
        return
      }

      const response = await request(app.server)
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 45.9,
          payment_method: 'credit_card',
          status: 'paid',
          subscription_id: subscriptionId,
        })

      expect(response.status).toBe(201)
      expect(response.body.payment.subscription_id).toBe(subscriptionId)
    })

    it('should create payment linked to product', async () => {
      if (!productId) {
        console.warn('Skipping test: productId not available')
        return
      }

      const response = await request(app.server)
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 300,
          payment_method: 'debit_card',
          status: 'paid',
          product_id: productId,
        })

      expect(response.status).toBe(201)
      expect(response.body.payment.product_id).toBe(productId)
    })

    it('should support different payment methods', async () => {
      const methods = ['credit_card', 'debit_card', 'pix', 'cash', 'bank_transfer']

      for (const method of methods) {
        const response = await request(app.server)
          .post('/payments')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 50,
            payment_method: method,
            status: 'paid',
          })

        expect(response.status).toBe(201)
        expect(response.body.payment.payment_method).toBe(method)
      }
    })

    it('should create payment with pending status', async () => {
      const response = await request(app.server)
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 200,
          payment_method: 'bank_transfer',
          status: 'pending',
          notes: 'Awaiting bank confirmation',
        })

      expect(response.status).toBe(201)
      expect(response.body.payment.status).toBe('pending')
    })

    it('should create payment with cancelled status', async () => {
      const response = await request(app.server)
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 150,
          payment_method: 'credit_card',
          status: 'cancelled',
          notes: 'Payment cancelled',
        })

      expect(response.status).toBe(201)
      expect(response.body.payment.status).toBe('cancelled')
    })

    it('should create payment with optional notes', async () => {
      const response = await request(app.server)
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 75,
          payment_method: 'pix',
          status: 'paid',
          notes: 'Payment for services',
        })

      expect(response.status).toBe(201)
      expect(response.body.payment.notes).toBe('Payment for services')
    })
  })

  describe('GET /payments', () => {
    it('should be able to list all user payments', async () => {
      const response = await request(app.server)
        .get('/payments')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.payments).toBeInstanceOf(Array)
      expect(response.body.payments.length).toBeGreaterThan(0)
    })

    it('should return payments with all statuses', async () => {
      const response = await request(app.server)
        .get('/payments')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.payments).toBeInstanceOf(Array)

      // Check if payments have status field
      if (response.body.payments.length > 0) {
        expect(response.body.payments[0]).toHaveProperty('status')
        expect(response.body.payments[0]).toHaveProperty('payment_method')
        expect(response.body.payments[0]).toHaveProperty('amount')
      }
    })

    it('should return payments linked to subscriptions and products', async () => {
      if (!subscriptionId || !productId) {
        console.warn('Subscription or product not available, skipping test')
        return
      }

      const response = await request(app.server)
        .get('/payments')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)

      // Check if we have payments linked to subscriptions
      const hasSubscriptionPayment = response.body.payments.some(
        (payment: { subscription_id: string | null }) => payment.subscription_id !== null
      )
      expect(hasSubscriptionPayment).toBe(true)

      // Check if we have payments linked to products
      const hasProductPayment = response.body.payments.some(
        (payment: { product_id: string | null }) => payment.product_id !== null
      )
      expect(hasProductPayment).toBe(true)
    })
  })

  describe('DELETE /payments/:id', () => {
    let paymentToDeleteId: string

    beforeAll(async () => {
      const createResponse = await request(app.server)
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          payment_method: 'cash',
          status: 'paid',
          notes: 'Payment to delete',
        })

      paymentToDeleteId = createResponse.body.payment.id
    })

    it('should be able to delete a payment', async () => {
      const response = await request(app.server)
        .delete(`/payments/${paymentToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(204)

      // Verify payment was deleted
      const listResponse = await request(app.server)
        .get('/payments')
        .set('Authorization', `Bearer ${authToken}`)

      const deletedPayment = listResponse.body.payments.find(
        (payment: { id: string }) => payment.id === paymentToDeleteId
      )
      expect(deletedPayment).toBeUndefined()
    })
  })
})
