import { FastifyInstance } from 'fastify'
import { create } from './create'
import { fetch } from './fetch'
import { remove } from './remove'
import { update } from './update'

export async function calendarRoutes(app: FastifyInstance) {
  app.get('/calendar', { preHandler: [app.authenticate] }, fetch)
  app.post('/calendar', { preHandler: [app.authenticate] }, create)
  app.put('/calendar/:id', { preHandler: [app.authenticate] }, update)
  app.delete('/calendar/:id', { preHandler: [app.authenticate] }, remove)
}
