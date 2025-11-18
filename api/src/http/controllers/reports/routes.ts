import type { FastifyInstance } from 'fastify'
import { getFinancialReport } from './get-financial-report'

export async function reportsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    await request.jwtVerify()
  })

  app.get('/reports/financial', getFinancialReport)
}
