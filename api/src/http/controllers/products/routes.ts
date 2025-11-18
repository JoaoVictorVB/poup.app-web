import type { FastifyInstance } from 'fastify'
import { create } from './create'
import { fetch } from './fetch'
import { remove } from './remove'
import { update } from './update'

export async function productsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    await request.jwtVerify()
  })

  app.post('/products', create)
  app.get('/products', fetch)
  app.put('/products/:id', update)
  app.delete('/products/:id', remove)
}
