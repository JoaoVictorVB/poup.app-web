import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  cleanupTestApp,
  createAuthenticatedUser,
  resetDatabase,
  setupTestApp,
} from './test-helpers'

describe('Products - DELETE /products/:id (E2E)', () => {
  let authToken: string
  let productToDeleteId: string

  beforeAll(async () => {
    await setupTestApp()
  })

  beforeEach(async () => {
    await resetDatabase()
    authToken = await createAuthenticatedUser('products-delete@example.com', 'Password123!')

    // Create a product to delete
    const createResponse = await request(app.server)
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Product to Delete',
        category: 'shopping',
        total_price: 500,
        installments: 1,
        paid_installments: 0,
        installment_value: 500,
        status: 'pending',
      })

    productToDeleteId = createResponse.body.product.id
  })

  afterAll(async () => {
    await cleanupTestApp()
  })

  it('should delete a product successfully', async () => {
    const response = await request(app.server)
      .delete(`/products/${productToDeleteId}`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(response.status).toBe(204)

    // Verify product was deleted
    const listResponse = await request(app.server)
      .get('/products')
      .set('Authorization', `Bearer ${authToken}`)

    const deletedProduct = listResponse.body.products.find(
      (product: { id: string }) => product.id === productToDeleteId
    )
    expect(deletedProduct).toBeUndefined()
  })
})
