import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  cleanupTestApp,
  createAuthenticatedUser,
  resetDatabase,
  setupTestApp,
} from './test-helpers'

describe('Products - POST /products (E2E)', () => {
  let authToken: string

  beforeAll(async () => {
    await setupTestApp()
  })

  beforeEach(async () => {
    await resetDatabase()
    authToken = await createAuthenticatedUser('products-create@example.com', 'Password123!')
  })

  afterAll(async () => {
    await cleanupTestApp()
  })

  it('should create a new product successfully', async () => {
    const response = await request(app.server)
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Notebook Dell',
        category: 'shopping',
        total_price: 3000,
        installments: 10,
        paid_installments: 0,
        installment_value: 300,
        purchase_date: '2024-01-15',
        next_payment: '2024-02-15',
        description: 'Notebook para trabalho',
        status: 'pending',
      })

    expect(response.status).toBe(201)
    expect(response.body.product).toHaveProperty('id')
    expect(response.body.product.name).toBe('Notebook Dell')
    expect(response.body.product.total_price).toBe(3000)
    expect(response.body.product.installments).toBe(10)
  })

  it('should create product with installment plan', async () => {
    const response = await request(app.server)
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'iPhone 15',
        category: 'shopping',
        total_price: 5000,
        installments: 12,
        paid_installments: 0,
        installment_value: 416.67,
        next_payment: '2024-03-01',
        status: 'pending',
      })

    expect(response.status).toBe(201)
    expect(response.body.product.installments).toBe(12)
    expect(response.body.product.paid_installments).toBe(0)
    expect(response.body.product.status).toBe('pending')
  })

  it('should create products with different categories', async () => {
    const categories = ['food', 'transport', 'entertainment', 'health', 'shopping', 'other']

    for (const category of categories) {
      const response = await request(app.server)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Product ${category}`,
          category,
          total_price: 100,
          installments: 1,
          paid_installments: 0,
          installment_value: 100,
          status: 'pending',
        })

      expect(response.status).toBe(201)
      expect(response.body.product.category).toBe(category)
    }
  })
})
