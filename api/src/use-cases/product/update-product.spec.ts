import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryProductRepository } from '../../repositories/in-memory/in-memory-product-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { UpdateProductUseCase } from './update-product'

let productRepository: InMemoryProductRepository
let sut: UpdateProductUseCase

describe('Update Product Use Case', () => {
  beforeEach(() => {
    productRepository = new InMemoryProductRepository()
    sut = new UpdateProductUseCase(productRepository)
  })

  it('should be able to update a product', async () => {
    const createdProduct = await productRepository.create({
      name: 'Old Product Name',
      category: 'shopping',
      total_price: 1000,
      installments: 5,
      paid_installments: 2,
      installment_value: 200,
      status: 'partial',
      user: {
        connect: { id: 'user-01' },
      },
    })

    const { product } = await sut.execute({
      product_id: createdProduct.id,
      user_id: 'user-01',
      name: 'Updated Product Name',
      status: 'paid',
    })

    expect(product.name).toBe('Updated Product Name')
    expect(product.status).toBe('paid')
  })

  it('should throw ResourceNotFoundError when product does not exist', async () => {
    await expect(() =>
      sut.execute({
        product_id: 'non-existing-product',
        user_id: 'user-01',
        name: 'Updated Name',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should throw ResourceNotFoundError when user does not own the product (IDOR protection)', async () => {
    const createdProduct = await productRepository.create({
      name: 'User 1 Product',
      category: 'shopping',
      total_price: 1000,
      installments: 1,
      paid_installments: 0,
      installment_value: 1000,
      status: 'pending',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await expect(() =>
      sut.execute({
        product_id: createdProduct.id,
        user_id: 'user-02', // Different user trying to update
        name: 'Hacked Name',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should update product installment information', async () => {
    const createdProduct = await productRepository.create({
      name: 'TV',
      category: 'shopping',
      total_price: 2400,
      installments: 12,
      paid_installments: 3,
      installment_value: 200,
      status: 'partial',
      user: {
        connect: { id: 'user-01' },
      },
    })

    const { product } = await sut.execute({
      product_id: createdProduct.id,
      user_id: 'user-01',
      paid_installments: 12,
      status: 'paid',
    })

    expect(product.paid_installments).toBe(12)
    expect(product.status).toBe('paid')
    expect(product.installments).toBe(12) // Should remain unchanged
  })

  it('should update product next payment date', async () => {
    const createdProduct = await productRepository.create({
      name: 'Notebook',
      category: 'shopping',
      total_price: 3000,
      installments: 10,
      paid_installments: 2,
      installment_value: 300,
      next_payment: new Date('2024-01-15'),
      status: 'partial',
      user: {
        connect: { id: 'user-01' },
      },
    })

    const newPaymentDate = new Date('2024-02-15')

    const { product } = await sut.execute({
      product_id: createdProduct.id,
      user_id: 'user-01',
      next_payment: newPaymentDate.toISOString(),
    })

    expect(product.next_payment).toEqual(newPaymentDate)
  })

  it('should update multiple fields at once', async () => {
    const createdProduct = await productRepository.create({
      name: 'Original Name',
      category: 'shopping',
      total_price: 1000,
      installments: 10,
      paid_installments: 0,
      installment_value: 100,
      status: 'pending',
      description: 'Original description',
      user: {
        connect: { id: 'user-01' },
      },
    })

    const { product } = await sut.execute({
      product_id: createdProduct.id,
      user_id: 'user-01',
      name: 'New Name',
      category: 'health',
      description: 'New description',
      status: 'partial',
      paid_installments: 5,
    })

    expect(product.name).toBe('New Name')
    expect(product.category).toBe('health')
    expect(product.description).toBe('New description')
    expect(product.status).toBe('partial')
    expect(product.paid_installments).toBe(5)
  })
})
