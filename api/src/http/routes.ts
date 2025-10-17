import { FastifyInstance } from 'fastify'
import { calendarRoutes } from './controllers/calendar/routes'
import { subscriptionsRoutes } from './controllers/subscriptions/routes'
import { usersRoutes } from './controllers/users/routes'

export async function appRoutes(app: FastifyInstance) {
  app.register(usersRoutes)
  app.register(subscriptionsRoutes)
  app.register(calendarRoutes)
}
