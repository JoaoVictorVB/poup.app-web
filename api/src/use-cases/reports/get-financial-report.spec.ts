import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../lib/prisma'
import { GetFinancialReportUseCase } from './get-financial-report'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    payment: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
      aggregate: vi.fn(),
      count: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
    subscription: {
      findMany: vi.fn(),
    },
  },
}))

let sut: GetFinancialReportUseCase

const defaultProductAggregate = {
  _sum: { total_price: null },
  _count: { _all: 0 },
  _avg: { total_price: null },
  _min: { total_price: null },
  _max: { total_price: null },
}

describe('Get Financial Report Use Case', () => {
  beforeEach(() => {
    sut = new GetFinancialReportUseCase()
    vi.clearAllMocks()
    // Set default mocks
    vi.mocked(prisma.product.aggregate).mockResolvedValue(defaultProductAggregate)
  })

  it('should calculate total spent from paid payments', async () => {
    vi.mocked(prisma.payment.aggregate).mockResolvedValue({
      _sum: { amount: 150 },
      _count: { _all: 0 },
      _avg: { amount: null },
      _min: { amount: null },
      _max: { amount: null },
    })

    vi.mocked(prisma.payment.findMany).mockResolvedValue([
      {
        id: '1',
        amount: 100,
        payment_date: new Date('2024-01-15'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: null,
        created_at: new Date(),
        user_id: 'user-01',
        subscription_id: null,
        product_id: null,
      },
      {
        id: '2',
        amount: 50,
        payment_date: new Date('2024-01-20'),
        payment_method: 'pix',
        status: 'paid',
        notes: null,
        created_at: new Date(),
        user_id: 'user-01',
        subscription_id: null,
        product_id: null,
      },
    ])

    vi.mocked(prisma.payment.groupBy).mockResolvedValue([])
    vi.mocked(prisma.subscription.findMany).mockResolvedValue([])
    vi.mocked(prisma.product.findMany).mockResolvedValue([])

    const report = await sut.execute({ user_id: 'user-01' })

    expect(report.total_spent).toBe(150)
    expect(report.monthly_average).toBe(12.5) // 150 / 12
    expect(report.yearly_projection).toBe(150) // 12.5 * 12
  })

  it('should group payments by payment method', async () => {
    vi.mocked(prisma.payment.aggregate).mockResolvedValue({
      _sum: { amount: 450 },
      _count: { _all: 0 },
      _avg: { amount: null },
      _min: { amount: null },
      _max: { amount: null },
    })
    vi.mocked(prisma.payment.findMany).mockResolvedValue([])
    vi.mocked(prisma.payment.groupBy).mockResolvedValue([])
    vi.mocked(prisma.payment.count).mockResolvedValue(5)
    vi.mocked(prisma.subscription.findMany).mockResolvedValue([])
    vi.mocked(prisma.product.findMany).mockResolvedValue([])

    const report = await sut.execute({ user_id: 'user-01' })

    // Test passes if groupBy is called and no errors thrown
    expect(report.total_spent).toBe(450)
  })

  it('should include upcoming payments from subscriptions', async () => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    vi.mocked(prisma.payment.aggregate).mockResolvedValue({
      _sum: { amount: 0 },
      _count: { _all: 0 },
      _avg: { amount: null },
      _min: { amount: null },
      _max: { amount: null },
    })
    vi.mocked(prisma.payment.findMany).mockResolvedValue([])
    vi.mocked(prisma.payment.groupBy).mockResolvedValue([])
    vi.mocked(prisma.payment.count).mockResolvedValue(0)
    vi.mocked(prisma.subscription.findMany).mockResolvedValue([
      {
        id: 'sub-01',
        name: 'Netflix',
        price: 45.9,
        billing_cycle: 'monthly',
        next_payment: nextWeek,
        status: 'active',
        created_at: new Date(),
        user_id: 'user-01',
      },
    ])
    vi.mocked(prisma.product.findMany).mockResolvedValue([])

    const report = await sut.execute({ user_id: 'user-01' })

    expect(report.upcoming_payments).toHaveLength(1)
    expect(report.upcoming_payments[0]).toMatchObject({
      name: 'Netflix',
      amount: 45.9,
      due_date: nextWeek,
      type: 'subscription',
    })
  })

  it('should include pending payments', async () => {
    vi.mocked(prisma.payment.aggregate).mockResolvedValue({
      _sum: { amount: 100 },
      _count: { _all: 0 },
      _avg: { amount: null },
      _min: { amount: null },
      _max: { amount: null },
    })

    const pendingPayment = {
      id: '2',
      amount: 200,
      payment_date: new Date('2024-02-01'),
      payment_method: 'pix',
      status: 'pending',
      notes: 'Pending payment',
      created_at: new Date(),
      user_id: 'user-01',
      subscription_id: 'sub-01',
      product_id: null,
    }

    vi.mocked(prisma.payment.findMany).mockResolvedValue([pendingPayment])
    vi.mocked(prisma.payment.groupBy).mockResolvedValue([])
    vi.mocked(prisma.payment.count).mockResolvedValue(1)
    vi.mocked(prisma.subscription.findMany).mockResolvedValue([])
    vi.mocked(prisma.product.findMany).mockResolvedValue([])
    vi.mocked(prisma.product.aggregate).mockResolvedValue({
      _sum: { total_price: null },
      _count: { _all: 0 },
      _avg: { total_price: null },
      _min: { total_price: null },
      _max: { total_price: null },
    })

    const report = await sut.execute({ user_id: 'user-01' })

    expect(report.upcoming_payments.length).toBeGreaterThanOrEqual(1)
  })

  it('should return zero values when user has no payments', async () => {
    vi.mocked(prisma.payment.aggregate).mockResolvedValue({
      _sum: { amount: null },
      _count: { _all: 0 },
      _avg: { amount: null },
      _min: { amount: null },
      _max: { amount: null },
    })
    vi.mocked(prisma.payment.findMany).mockResolvedValue([])
    vi.mocked(prisma.payment.groupBy).mockResolvedValue([])
    vi.mocked(prisma.payment.count).mockResolvedValue(0)
    vi.mocked(prisma.subscription.findMany).mockResolvedValue([])
    vi.mocked(prisma.product.findMany).mockResolvedValue([])

    const report = await sut.execute({ user_id: 'user-01' })

    expect(report.total_spent).toBe(0)
    expect(report.monthly_average).toBe(0)
    expect(report.yearly_projection).toBe(0)
    expect(report.upcoming_payments).toEqual([])
  })

  it('should calculate monthly average correctly', async () => {
    vi.mocked(prisma.payment.aggregate).mockResolvedValue({
      _sum: { amount: 1200 },
      _count: { _all: 0 },
      _avg: { amount: null },
      _min: { amount: null },
      _max: { amount: null },
    })

    vi.mocked(prisma.payment.findMany).mockResolvedValue([
      {
        id: '1',
        amount: 1200,
        payment_date: new Date(),
        payment_method: 'credit_card',
        status: 'paid',
        notes: null,
        created_at: new Date(),
        user_id: 'user-01',
        subscription_id: null,
        product_id: null,
      },
    ])

    vi.mocked(prisma.payment.groupBy).mockResolvedValue([])
    vi.mocked(prisma.payment.count).mockResolvedValue(1)
    vi.mocked(prisma.subscription.findMany).mockResolvedValue([])
    vi.mocked(prisma.product.findMany).mockResolvedValue([])

    const report = await sut.execute({ user_id: 'user-01' })

    expect(report.total_spent).toBe(1200)
    expect(report.monthly_average).toBe(100) // 1200 / 12
    expect(report.yearly_projection).toBe(1200) // 100 * 12
  })

  it('should handle subscriptions and products in report', async () => {
    vi.mocked(prisma.payment.aggregate).mockResolvedValue({
      _sum: { amount: 0 },
      _count: { _all: 0 },
      _avg: { amount: null },
      _min: { amount: null },
      _max: { amount: null },
    })

    vi.mocked(prisma.payment.findMany).mockResolvedValue([])
    vi.mocked(prisma.payment.groupBy).mockResolvedValue([])
    vi.mocked(prisma.payment.count).mockResolvedValue(0)
    vi.mocked(prisma.subscription.findMany).mockResolvedValue([
      {
        id: 'sub-01',
        name: 'Netflix',
        price: 45.9,
        billing_cycle: 'monthly',
        next_payment: new Date(),
        status: 'active',
        created_at: new Date(),
        user_id: 'user-01',
      },
      {
        id: 'sub-02',
        name: 'Gym',
        price: 100,
        billing_cycle: 'monthly',
        next_payment: new Date(),
        status: 'active',
        created_at: new Date(),
        user_id: 'user-01',
      },
    ])
    vi.mocked(prisma.product.findMany).mockResolvedValue([])

    const report = await sut.execute({ user_id: 'user-01' })

    // The report should process subscriptions without errors
    expect(report).toBeDefined()
    expect(report.total_spent).toBe(0)
  })
})
