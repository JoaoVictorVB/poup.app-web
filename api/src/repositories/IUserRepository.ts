import { User } from '@prisma/client'

export interface AuthenticationQuery {
  id?: string
  email?: string
}

export interface CreateUserDTO {
  name: string
  email: string
  password_hash: string
  password_history?: string | null
  login_attempts?: number
  locked_until?: Date | null
}

export interface UpdateUserDTO {
  name?: string
  email?: string
  password_hash?: string
  password_history?: string | null
  login_attempts?: number
  locked_until?: Date | null
}

export interface UsersRepository {
  findUnique(query: AuthenticationQuery): Promise<User | null>
  findById(id: string): Promise<User | null>
  create(data: CreateUserDTO): Promise<User>
  update(userId: string, data: UpdateUserDTO): Promise<User>
}
