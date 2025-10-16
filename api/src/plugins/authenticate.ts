import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { UnauthorizedError } from '../lib/errors'

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export default fp(async function (fastify: FastifyInstance) {
  fastify.decorate('authenticate', async function(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      throw new UnauthorizedError('Token de autenticação inválido ou expirado')
    }
  })
}, {
  name: 'authenticate',
  dependencies: ['@fastify/jwt']
})