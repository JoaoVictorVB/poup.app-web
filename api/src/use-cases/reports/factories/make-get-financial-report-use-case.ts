import { GetFinancialReportUseCase } from '../get-financial-report'

export function makeGetFinancialReportUseCase() {
  const useCase = new GetFinancialReportUseCase()

  return useCase
}
