import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import fastify from 'fastify'
import { appRoutes } from './http/routes'
import { errorHandler } from './lib/errorHandler'
import authenticate from './plugins/authenticate'

const app = fastify({
  logger: process.env.NODE_ENV === 'development',
})

app.setErrorHandler(errorHandler)

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

app.register(authenticate)

app.register(appRoutes)

app.listen({
  port: Number(process.env.PORT) || 3333,
  host: '0.0.0.0',
}).then(() => {
  console.log('🚀 HTTP Server Running!')
})