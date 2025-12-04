import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import fastify from 'fastify'
import { appRoutes } from './http/routes'
import { errorHandler } from './lib/errorHandler'
import authenticate from './plugins/authenticate'
import idsPlugin from './plugins/ids'

export const app = fastify({
  logger: process.env.NODE_ENV === 'development',
})

app.setErrorHandler(errorHandler)

app.addHook('onSend', async (request, reply) => {
  reply.header('X-Content-Type-Options', 'nosniff')
  reply.header('X-Frame-Options', 'SAMEORIGIN')
  reply.header('X-XSS-Protection', '1; mode=block')
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  reply.header('Content-Security-Policy', "default-src 'self'")
})

app.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
    statusCode: 429,
  }),
})

app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'poupapp-secret',
  sign: {
    expiresIn: '30m',
  },
})

app.register(idsPlugin)

app.register(authenticate)

app.register(appRoutes)
