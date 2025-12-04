import { User } from '@prisma/client'
import { randomUUID } from 'crypto'
import {
  AuthenticationQuery,
  CreateUserDTO,
  UpdateUserDTO,
  UsersRepository,
} from '../IUserRepository'

export class InMemoryUserRepository implements UsersRepository {
  public users: User[] = []

  async findUnique(query: AuthenticationQuery): Promise<User | null> {
    if (query.id) {
      return this.findById(query.id)
    }
    if (query.email) {
      const user = this.users.find((user) => user.email === query.email)
      return user || null
    }
    return null
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((user) => user.id === id)
    return user || null
  }

  async create(data: CreateUserDTO): Promise<User> {
    const user: User = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      password_history: data.password_history || null,
      login_attempts: data.login_attempts || 0,
      locked_until: data.locked_until || null,
      created_at: new Date(),
    }

    this.users.push(user)
    return user
  }

  async update(userId: string, data: UpdateUserDTO): Promise<User> {
    const userIndex = this.users.findIndex((user) => user.id === userId)

    if (userIndex === -1) {
      throw new Error('User not found')
    }

    const updatedUser: User = {
      ...this.users[userIndex],
      name: data.name || this.users[userIndex].name,
      email: data.email || this.users[userIndex].email,
      password_hash: data.password_hash || this.users[userIndex].password_hash,
      password_history:
        data.password_history !== undefined
          ? data.password_history
          : this.users[userIndex].password_history,
      login_attempts:
        data.login_attempts !== undefined
          ? data.login_attempts
          : this.users[userIndex].login_attempts,
      locked_until:
        data.locked_until !== undefined ? data.locked_until : this.users[userIndex].locked_until,
    }

    this.users[userIndex] = updatedUser
    return updatedUser
  }

  async delete(userId: string): Promise<void> {
    const userIndex = this.users.findIndex((user) => user.id === userId)

    if (userIndex === -1) {
      throw new Error('User not found')
    }

    this.users.splice(userIndex, 1)
  }
}
