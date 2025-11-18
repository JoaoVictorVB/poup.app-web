import type { Prisma, Product } from '@prisma/client'

export interface IProductRepository {
  create(data: Prisma.ProductCreateInput): Promise<Product>
  findById(id: string): Promise<Product | null>
  findByUserId(userId: string): Promise<Product[]>
  update(id: string, data: Prisma.ProductUpdateInput): Promise<Product>
  delete(id: string): Promise<void>
}
