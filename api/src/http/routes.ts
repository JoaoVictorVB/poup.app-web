import { FastifyInstance } from 'fastify'
import { calendarRoutes } from './controllers/calendar/routes'
import { paymentsRoutes } from './controllers/payments/routes'
import { productsRoutes } from './controllers/products/routes'
import { reportsRoutes } from './controllers/reports/routes'
import { subscriptionsRoutes } from './controllers/subscriptions/routes'
import { usersRoutes } from './controllers/users/routes'

export async function appRoutes(app: FastifyInstance) {
  app.register(usersRoutes)
  app.register(subscriptionsRoutes)
  app.register(calendarRoutes)
  app.register(productsRoutes)
  app.register(paymentsRoutes)
  app.register(reportsRoutes)
}
