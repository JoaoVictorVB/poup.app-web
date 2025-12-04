import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  cleanupTestApp,
  createAuthenticatedUser,
  resetDatabase,
  setupTestApp,
} from './test-helpers'

describe('Products - GET /products (E2E)', () => {
  let authToken: string

  beforeAll(async () => {
    await setupTestApp()
  })

  beforeEach(async () => {
    await resetDatabase()
    authToken = await createAuthenticatedUser('products-fetch@example.com', 'Password123!')

    // Create some products for testing
    await request(app.server).post('/products').set('Authorization', `Bearer ${authToken}`).send({
      name: 'Test Product 1',
      category: 'shopping',
      total_price: 1000,
      installments: 5,
      paid_installments: 0,
      installment_value: 200,
      status: 'pending',
    })

    await request(app.server).post('/products').set('Authorization', `Bearer ${authToken}`).send({
      name: 'Test Product 2',
      category: 'entertainment',
      total_price: 500,
      installments: 1,
      paid_installments: 1,
      installment_value: 500,
      status: 'paid',
    })
  })

  afterAll(async () => {
    await cleanupTestApp()
  })

  it('should list all user products successfully', async () => {
    const response = await request(app.server)
      .get('/products')
      .set('Authorization', `Bearer ${authToken}`)

    expect(response.status).toBe(200)
    expect(response.body.products).toBeInstanceOf(Array)
    expect(response.body.products.length).toBe(2)
    expect(response.body.products[0]).toHaveProperty('id')
    expect(response.body.products[0]).toHaveProperty('name')
    expect(response.body.products[0]).toHaveProperty('category')
  })

  it('should return products with different statuses', async () => {
    const response = await request(app.server)
      .get('/products')
      .set('Authorization', `Bearer ${authToken}`)

    expect(response.status).toBe(200)
    expect(response.body.products.some((p: { status: string }) => p.status === 'pending')).toBe(
      true
    )
    expect(response.body.products.some((p: { status: string }) => p.status === 'paid')).toBe(true)
  })
})
