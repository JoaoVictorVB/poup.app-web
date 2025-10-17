import { FastifyInstance } from 'fastify'
import { create } from './create'
import { fetch } from './fetch'
import { remove } from './remove'
import { update } from './update'

export async function subscriptionsRoutes(app: FastifyInstance) {
  app.get('/subscriptions', { preHandler: [app.authenticate] }, fetch)
  app.post('/subscriptions', { preHandler: [app.authenticate] }, create)
  app.put('/subscriptions/:id', { preHandler: [app.authenticate] }, update)
  app.delete('/subscriptions/:id', { preHandler: [app.authenticate] }, remove)
}
