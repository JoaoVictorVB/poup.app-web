import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryProductRepository } from '../../repositories/in-memory/in-memory-product-repository'
import { CreateProductUseCase } from './create-product'

let productRepository: InMemoryProductRepository
let sut: CreateProductUseCase

describe('Create Product Use Case', () => {
  beforeEach(() => {
    productRepository = new InMemoryProductRepository()
    sut = new CreateProductUseCase(productRepository)
  })

  it('should be able to create a product', async () => {
    const { product } = await sut.execute({
      name: 'Notebook Dell',
      category: 'shopping',
      total_price: 3000,
      installments: 10,
      paid_installments: 0,
      installment_value: 300,
      purchase_date: new Date('2024-01-15'),
      next_payment: new Date('2024-02-15'),
      description: 'Notebook para trabalho',
      status: 'pending',
      user_id: 'user-01',
    })

    expect(product.id).toEqual(expect.any(String))
    expect(product.name).toBe('Notebook Dell')
    expect(product.category).toBe('shopping')
    expect(product.total_price).toBe(3000)
    expect(product.installments).toBe(10)
    expect(product.paid_installments).toBe(0)
    expect(product.installment_value).toBe(300)
    expect(product.status).toBe('pending')
    expect(product.user_id).toBe('user-01')
  })

  it('should create product with default values when optional fields are not provided', async () => {
    const { product } = await sut.execute({
      name: 'iPhone 15',
      category: 'shopping',
      total_price: 5000,
      installments: 1,
      paid_installments: 0,
      installment_value: 5000,
      status: 'pending',
      user_id: 'user-01',
    })

    expect(product.id).toEqual(expect.any(String))
    expect(product.description).toBeNull()
    expect(product.next_payment).toBeNull()
    expect(product.purchase_date).toEqual(expect.any(Date))
    expect(product.created_at).toEqual(expect.any(Date))
  })

  it('should create product with installment plan', async () => {
    const { product } = await sut.execute({
      name: 'Smart TV 55"',
      category: 'shopping',
      total_price: 2400,
      installments: 12,
      paid_installments: 0,
      installment_value: 200,
      next_payment: new Date('2024-02-01'),
      status: 'pending',
      user_id: 'user-01',
    })

    expect(product.installments).toBe(12)
    expect(product.paid_installments).toBe(0)
    expect(product.installment_value).toBe(200)
    expect(product.status).toBe('pending')
  })

  it('should link product to user', async () => {
    const { product } = await sut.execute({
      name: 'Geladeira',
      category: 'shopping',
      total_price: 1800,
      installments: 6,
      paid_installments: 0,
      installment_value: 300,
      status: 'pending',
      user_id: 'user-02',
    })

    expect(product.user_id).toBe('user-02')
  })

  it('should create product with different categories', async () => {
    const categories = ['food', 'transport', 'entertainment', 'health', 'shopping', 'other']

    for (const category of categories) {
      const { product } = await sut.execute({
        name: `Product ${category}`,
        category,
        total_price: 100,
        installments: 1,
        paid_installments: 0,
        installment_value: 100,
        status: 'pending',
        user_id: 'user-01',
      })

      expect(product.category).toBe(category)
    }
  })
})
