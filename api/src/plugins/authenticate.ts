import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { UnauthorizedError } from '../lib/errors'

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: string
      name: string
      email: string
    }
  }
}

export default fp(
  async function (fastify: FastifyInstance) {
    fastify.decorate(
      'authenticate',
      async function (request: FastifyRequest, _reply: FastifyReply) {
        try {
          await request.jwtVerify()
        } catch {
          throw new UnauthorizedError('Token de autenticação inválido ou expirado')
        }
      }
    )
  },
  {
    name: 'authenticate',
    dependencies: ['@fastify/jwt'],
  }
)
