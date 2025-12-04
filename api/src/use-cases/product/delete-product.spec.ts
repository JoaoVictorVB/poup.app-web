import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryProductRepository } from '../../repositories/in-memory/in-memory-product-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { DeleteProductUseCase } from './delete-product'

let productRepository: InMemoryProductRepository
let sut: DeleteProductUseCase

describe('Delete Product Use Case', () => {
  beforeEach(() => {
    productRepository = new InMemoryProductRepository()
    sut = new DeleteProductUseCase(productRepository)
  })

  it('should be able to delete a product', async () => {
    const product = await productRepository.create({
      name: 'Product to Delete',
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

    await sut.execute({
      product_id: product.id,
      user_id: 'user-01',
    })

    const deletedProduct = await productRepository.findById(product.id)

    expect(deletedProduct).toBeNull()
  })

  it('should throw ResourceNotFoundError when product does not exist', async () => {
    await expect(() =>
      sut.execute({
        product_id: 'non-existing-product',
        user_id: 'user-01',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should throw ResourceNotFoundError when user does not own the product (IDOR protection)', async () => {
    const product = await productRepository.create({
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
        product_id: product.id,
        user_id: 'user-02', // Different user trying to delete
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
