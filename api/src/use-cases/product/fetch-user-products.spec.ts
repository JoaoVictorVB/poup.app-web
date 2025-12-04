import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryProductRepository } from '../../repositories/in-memory/in-memory-product-repository'
import { FetchUserProductsUseCase } from './fetch-user-products'

let productRepository: InMemoryProductRepository
let sut: FetchUserProductsUseCase

describe('Fetch User Products Use Case', () => {
  beforeEach(() => {
    productRepository = new InMemoryProductRepository()
    sut = new FetchUserProductsUseCase(productRepository)
  })

  it('should be able to fetch all products for a user', async () => {
    await productRepository.create({
      name: 'Notebook',
      category: 'shopping',
      total_price: 3000,
      installments: 10,
      paid_installments: 2,
      installment_value: 300,
      status: 'partial',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await productRepository.create({
      name: 'iPhone',
      category: 'shopping',
      total_price: 5000,
      installments: 12,
      paid_installments: 0,
      installment_value: 416.67,
      status: 'pending',
      user: {
        connect: { id: 'user-01' },
      },
    })

    const { products } = await sut.execute({
      user_id: 'user-01',
    })

    expect(products).toHaveLength(2)
    expect(products[0].name).toBe('Notebook')
    expect(products[1].name).toBe('iPhone')
  })

  it('should return empty array when user has no products', async () => {
    const { products } = await sut.execute({
      user_id: 'user-without-products',
    })

    expect(products).toHaveLength(0)
    expect(products).toEqual([])
  })

  it('should only return products for the specified user (IDOR protection)', async () => {
    await productRepository.create({
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

    await productRepository.create({
      name: 'User 2 Product',
      category: 'shopping',
      total_price: 2000,
      installments: 1,
      paid_installments: 0,
      installment_value: 2000,
      status: 'pending',
      user: {
        connect: { id: 'user-02' },
      },
    })

    const { products } = await sut.execute({
      user_id: 'user-01',
    })

    expect(products).toHaveLength(1)
    expect(products[0].name).toBe('User 1 Product')
    expect(products[0].user_id).toBe('user-01')
  })

  it('should return products with different statuses', async () => {
    await productRepository.create({
      name: 'Paid Product',
      category: 'shopping',
      total_price: 500,
      installments: 1,
      paid_installments: 1,
      installment_value: 500,
      status: 'paid',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await productRepository.create({
      name: 'Pending Product',
      category: 'shopping',
      total_price: 1000,
      installments: 5,
      paid_installments: 0,
      installment_value: 200,
      status: 'pending',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await productRepository.create({
      name: 'Partial Product',
      category: 'shopping',
      total_price: 1200,
      installments: 6,
      paid_installments: 3,
      installment_value: 200,
      status: 'partial',
      user: {
        connect: { id: 'user-01' },
      },
    })

    const { products } = await sut.execute({
      user_id: 'user-01',
    })

    expect(products).toHaveLength(3)
    expect(products.map((p) => p.status)).toContain('paid')
    expect(products.map((p) => p.status)).toContain('pending')
    expect(products.map((p) => p.status)).toContain('partial')
  })
})
