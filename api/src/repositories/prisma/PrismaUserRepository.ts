import { User } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import {
    AuthenticationQuery,
    CreateUserDTO,
    UpdateUserDTO,
    UsersRepository
} from '../IUserRepository'

export class PrismaUsersRepository implements UsersRepository {
  async findUnique(query: AuthenticationQuery): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        id: query.id,
        email: query.email,
      },
    })
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  async create(data: CreateUserDTO): Promise<User> {
    return prisma.user.create({
      data,
    })
  }

  async update(userId: string, data: UpdateUserDTO): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data,
    })
  }

  async delete(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    })
  }
}
