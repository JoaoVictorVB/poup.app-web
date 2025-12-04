import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  cleanupTestApp,
  createAuthenticatedUser,
  resetDatabase,
  setupTestApp,
} from './test-helpers'

describe('Products - PUT /products/:id (E2E)', () => {
  let authToken: string
  let productId: string

  beforeAll(async () => {
    await setupTestApp()
  })

  beforeEach(async () => {
    await resetDatabase()
    authToken = await createAuthenticatedUser('products-update@example.com', 'Password123!')

    // Create a product to update
    const createResponse = await request(app.server)
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Product to Update',
        category: 'shopping',
        total_price: 1000,
        installments: 5,
        paid_installments: 0,
        installment_value: 200,
        status: 'pending',
      })

    productId = createResponse.body.product.id
  })

  afterAll(async () => {
    await cleanupTestApp()
  })

  it('should update product name and status successfully', async () => {
    const response = await request(app.server)
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Product Name',
        paid_installments: 2,
        status: 'partial',
      })

    expect(response.status).toBe(200)
    expect(response.body.product.name).toBe('Updated Product Name')
    expect(response.body.product.paid_installments).toBe(2)
    expect(response.body.product.status).toBe('partial')
  })

  it('should update product installment information', async () => {
    const response = await request(app.server)
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        paid_installments: 5,
        status: 'paid',
      })

    expect(response.status).toBe(200)
    expect(response.body.product.paid_installments).toBe(5)
    expect(response.body.product.status).toBe('paid')
  })
})
