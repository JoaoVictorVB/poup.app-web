import { FastifyInstance } from 'fastify'
import { authenticate } from './authenticate'
import { deleteUser } from './delete-user'
import { profile } from './profile'
import { register } from './register'
import { updatePassword } from './update-password'
import { updateUser } from './update-user'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post(
    '/sessions',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
    },
    authenticate
  )
  app.get('/me', { preHandler: [app.authenticate] }, profile)
  app.put('/me', { preHandler: [app.authenticate] }, updateUser)
  app.put('/me/password', { preHandler: [app.authenticate] }, updatePassword)
  app.delete('/me', { preHandler: [app.authenticate] }, deleteUser)
}
