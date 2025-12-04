import type { Prisma, Product } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import type { IProductRepository } from '../IProductRepository'

export class InMemoryProductRepository implements IProductRepository {
  public items: Product[] = []

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    const product: Product = {
      id: randomUUID(),
      name: data.name,
      category: data.category,
      total_price: data.total_price,
      installments: data.installments ?? 1,
      paid_installments: data.paid_installments ?? 0,
      installment_value: data.installment_value,
      purchase_date: data.purchase_date ? new Date(data.purchase_date) : new Date(),
      next_payment: data.next_payment ? new Date(data.next_payment) : null,
      description: data.description ?? null,
      status: data.status ?? 'pending',
      user_id: data.user.connect?.id ?? '',
      created_at: new Date(),
    }

    this.items.push(product)

    return product
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.items.find((item) => item.id === id)

    if (!product) {
      return null
    }

    return product
  }

  async findByUserId(userId: string): Promise<Product[]> {
    return this.items.filter((item) => item.user_id === userId)
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    const productIndex = this.items.findIndex((item) => item.id === id)

    if (productIndex === -1) {
      throw new Error('Product not found')
    }

    const product = this.items[productIndex]

    const updatedProduct: Product = {
      ...product,
      name: data.name !== undefined ? String(data.name) : product.name,
      category: data.category !== undefined ? String(data.category) : product.category,
      total_price: data.total_price !== undefined ? Number(data.total_price) : product.total_price,
      installments:
        data.installments !== undefined ? Number(data.installments) : product.installments,
      paid_installments:
        data.paid_installments !== undefined
          ? Number(data.paid_installments)
          : product.paid_installments,
      installment_value:
        data.installment_value !== undefined
          ? Number(data.installment_value)
          : product.installment_value,
      next_payment:
        data.next_payment !== undefined
          ? data.next_payment
            ? new Date(data.next_payment as Date)
            : null
          : product.next_payment,
      description: data.description !== undefined ? String(data.description) : product.description,
      status: data.status !== undefined ? String(data.status) : product.status,
    }

    this.items[productIndex] = updatedProduct

    return updatedProduct
  }

  async delete(id: string): Promise<void> {
    const productIndex = this.items.findIndex((item) => item.id === id)

    if (productIndex !== -1) {
      this.items.splice(productIndex, 1)
    }
  }
}
