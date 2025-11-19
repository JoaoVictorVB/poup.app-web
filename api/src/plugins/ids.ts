import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { isIPBlocked, logRateLimitExceeded, validateRequest } from '../lib/ids'

async function idsPlugin(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = request.ip

    if (isIPBlocked(ip)) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Your IP has been blocked due to suspicious activity',
        code: 'IP_BLOCKED',
      })
    }

    const isValid = await validateRequest(request)
    if (!isValid) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Suspicious request detected',
        code: 'SUSPICIOUS_REQUEST',
      })
    }
  })

  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    if (reply.statusCode === 429) {
      await logRateLimitExceeded(request.ip, request.url)
    }
  })
}

export default fp(idsPlugin, {
  name: 'ids-plugin',
})
