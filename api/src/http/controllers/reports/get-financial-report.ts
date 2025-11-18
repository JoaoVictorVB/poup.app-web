import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetFinancialReportUseCase } from '../../../use-cases/reports/factories/make-get-financial-report-use-case'

export async function getFinancialReport(request: FastifyRequest, reply: FastifyReply) {
  const getReportQuerySchema = z.object({
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional(),
  })

  const { start_date, end_date } = getReportQuerySchema.parse(request.query)

  const getFinancialReportUseCase = makeGetFinancialReportUseCase()

  const report = await getFinancialReportUseCase.execute({
    user_id: request.user.sub,
    start_date,
    end_date,
  })

  return reply.status(200).send(report)
}
