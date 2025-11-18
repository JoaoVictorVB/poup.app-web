import { prisma } from '../../lib/prisma'

interface GetFinancialReportUseCaseRequest {
  user_id: string
  start_date?: Date
  end_date?: Date
}

interface GetFinancialReportUseCaseResponse {
  total_spent: number
  monthly_average: number
  yearly_projection: number
  subscriptions_total: number
  products_total: number
  payments_by_method: Record<string, number>
  payments_by_status: Record<string, number>
  spending_by_category: Record<string, number>
  upcoming_payments: Array<{
    id: string
    name: string
    amount: number
    due_date: Date
    type: 'subscription' | 'pending_payment'
  }>
}

export class GetFinancialReportUseCase {
  async execute({
    user_id,
    start_date,
    end_date,
  }: GetFinancialReportUseCaseRequest): Promise<GetFinancialReportUseCaseResponse> {
    const dateFilter = {
      ...(start_date && { gte: start_date }),
      ...(end_date && { lte: end_date }),
    }

    // Total gasto (pagamentos confirmados)
    const paymentsResult = await prisma.payment.aggregate({
      where: {
        user_id,
        status: 'paid',
        ...(Object.keys(dateFilter).length > 0 && { payment_date: dateFilter }),
      },
      _sum: {
        amount: true,
      },
    })

    const total_spent = paymentsResult._sum.amount || 0

    console.log('📊 Financial Report Debug:', {
      user_id,
      total_spent,
      paymentsCount: await prisma.payment.count({ where: { user_id } }),
    })

    // Pagamentos por método
    const paymentsByMethod = await prisma.payment.groupBy({
      by: ['payment_method'],
      where: {
        user_id,
        status: 'paid',
      },
      _sum: {
        amount: true,
      },
    })

    const payments_by_method = paymentsByMethod.reduce(
      (acc, item) => {
        acc[item.payment_method] = item._sum.amount || 0
        return acc
      },
      {} as Record<string, number>
    )

    console.log('💳 Payments by method:', payments_by_method)

    // Pagamentos por status
    const paymentsByStatus = await prisma.payment.groupBy({
      by: ['status'],
      where: {
        user_id,
      },
      _sum: {
        amount: true,
      },
    })

    const payments_by_status = paymentsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._sum.amount || 0
        return acc
      },
      {} as Record<string, number>
    )

    // Gastos por categoria (baseado em pagamentos de produtos)
    const paymentsByCategory = await prisma.payment.groupBy({
      by: ['product_id'],
      where: {
        user_id,
        status: 'paid',
        product_id: { not: null },
      },
      _sum: {
        amount: true,
      },
    })

    // Buscar produtos para obter suas categorias
    const productIds = paymentsByCategory.map((p) => p.product_id).filter(Boolean) as string[]
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        category: true,
      },
    })

    const productCategoryMap = products.reduce(
      (acc, p) => {
        acc[p.id] = p.category
        return acc
      },
      {} as Record<string, string>
    )

    const spending_by_category = paymentsByCategory.reduce(
      (acc, item) => {
        if (item.product_id) {
          const category = productCategoryMap[item.product_id]
          if (category) {
            acc[category] = (acc[category] || 0) + (item._sum.amount || 0)
          }
        }
        return acc
      },
      {} as Record<string, number>
    )

    console.log('📂 Spending by category:', spending_by_category)
    console.log('📦 Payments by status:', payments_by_status)

    // Total de assinaturas
    const subscriptions = await prisma.subscription.findMany({
      where: { user_id },
    })

    const subscriptions_total = subscriptions.reduce((total, sub) => {
      const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : sub.price
      return total + monthlyPrice
    }, 0)

    // Total de produtos
    const productsResult = await prisma.product.aggregate({
      where: { user_id },
      _sum: {
        total_price: true,
      },
    })

    const products_total = productsResult._sum.total_price || 0

    // Média mensal (últimos 12 meses ou período customizado)
    const monthsCount =
      start_date && end_date
        ? Math.max(
            1,
            Math.ceil((end_date.getTime() - start_date.getTime()) / (1000 * 60 * 60 * 24 * 30))
          )
        : 12

    const monthly_average = total_spent / monthsCount

    // Projeção anual
    const yearly_projection = monthly_average * 12

    // Próximos pagamentos (assinaturas com vencimento próximo)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const upcomingSubscriptions = await prisma.subscription.findMany({
      where: {
        user_id,
        next_payment: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      orderBy: {
        next_payment: 'asc',
      },
    })

    const upcomingPendingPayments = await prisma.payment.findMany({
      where: {
        user_id,
        status: 'pending',
        payment_date: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        product: true,
        subscription: true,
      },
      orderBy: {
        payment_date: 'asc',
      },
    })

    const upcoming_payments = [
      ...upcomingSubscriptions.map((sub) => ({
        id: sub.id,
        name: sub.name,
        amount: sub.price,
        due_date: sub.next_payment,
        type: 'subscription' as const,
      })),
      ...upcomingPendingPayments.map((payment) => ({
        id: payment.id,
        name: payment.product?.name || payment.subscription?.name || 'Pagamento pendente',
        amount: payment.amount,
        due_date: payment.payment_date,
        type: 'pending_payment' as const,
      })),
    ].sort((a, b) => a.due_date.getTime() - b.due_date.getTime())

    return {
      total_spent,
      monthly_average,
      yearly_projection,
      subscriptions_total,
      products_total,
      payments_by_method,
      payments_by_status,
      spending_by_category,
      upcoming_payments,
    }
  }
}
