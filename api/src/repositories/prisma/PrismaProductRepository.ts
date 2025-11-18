import type { Prisma, Product } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import type { IProductRepository } from '../IProductRepository'

export class PrismaProductRepository implements IProductRepository {
  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    const product = await prisma.product.create({
      data,
    })
    return product
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
    })
    return product
  }

  async findByUserId(userId: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { user_id: userId },
      orderBy: { purchase_date: 'desc' },
    })
    return products
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    const product = await prisma.product.update({
      where: { id },
      data,
    })
    return product
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    })
  }
}
