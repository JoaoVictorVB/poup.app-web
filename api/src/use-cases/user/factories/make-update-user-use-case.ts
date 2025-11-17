import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUserRepository'
import { UpdateUserUseCase } from '../update-user'

export function makeUpdateUserUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const updateUserUseCase = new UpdateUserUseCase(usersRepository)

  return updateUserUseCase
}
