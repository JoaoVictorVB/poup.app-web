import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ConflictError, NotFoundError, UnauthorizedError } from '../lib/errors'
import { prisma } from '../lib/prisma'

export async function userRoutes(app: FastifyInstance) {
  app.post('/users', async (request) => {
    const createUserSchema = z.object({
      name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
      email: z.string().email('Email inválido'),
      password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    })

    const { name, email, password } = createUserSchema.parse(request.body)
    
    const userExists = await prisma.user.findUnique({
      where: { email },
    })

    if (userExists) {
      throw new ConflictError('Este email já está cadastrado')
    }
    
    const password_hash = await bcrypt.hash(password, 6)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
      },
    })

    return { user: { id: user.id, name: user.name, email: user.email } }
  })

  app.post('/sessions', async (request) => {
    const loginSchema = z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(1, 'Senha é obrigatória'),
    })

    const { email, password } = loginSchema.parse(request.body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedError('Email ou senha incorretos')
    }

    const doesPasswordMatch = await bcrypt.compare(password, user.password_hash)

    if (!doesPasswordMatch) {
      throw new UnauthorizedError('Email ou senha incorretos')
    }

    const token = app.jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email
      },
      {
        expiresIn: '7d',
      },
    )

    return { token }
  })

  app.get('/me', {
    preHandler: [app.authenticate],
  }, async (request) => {
    const { id: userId } = request.user as { id: string, name: string, email: string }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    return { user: { id: user.id, name: user.name, email: user.email } }
  })
}