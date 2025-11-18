import type { FastifyInstance } from 'fastify'
import { create } from './create'
import { fetch } from './fetch'
import { remove } from './remove'

export async function paymentsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    await request.jwtVerify()
  })

  app.post('/payments', create)
  app.get('/payments', fetch)
  app.delete('/payments/:id', remove)
}
