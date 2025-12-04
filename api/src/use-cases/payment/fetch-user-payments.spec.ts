import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryPaymentRepository } from '../../repositories/in-memory/in-memory-payment-repository'
import { FetchUserPaymentsUseCase } from './fetch-user-payments'

let paymentRepository: InMemoryPaymentRepository
let sut: FetchUserPaymentsUseCase

describe('Fetch User Payments Use Case', () => {
  beforeEach(() => {
    paymentRepository = new InMemoryPaymentRepository()
    sut = new FetchUserPaymentsUseCase(paymentRepository)
  })

  it('should be able to fetch all payments for a user', async () => {
    await paymentRepository.create({
      amount: 49.9,
      payment_method: 'credit_card',
      status: 'paid',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await paymentRepository.create({
      amount: 100,
      payment_method: 'pix',
      status: 'paid',
      user: {
        connect: { id: 'user-01' },
      },
    })

    const { payments } = await sut.execute({
      user_id: 'user-01',
    })

    expect(payments).toHaveLength(2)
    expect(payments[0].amount).toBe(49.9)
    expect(payments[1].amount).toBe(100)
  })

  it('should return empty array when user has no payments', async () => {
    const { payments } = await sut.execute({
      user_id: 'user-without-payments',
    })

    expect(payments).toHaveLength(0)
    expect(payments).toEqual([])
  })

  it('should only return payments for the specified user (IDOR protection)', async () => {
    await paymentRepository.create({
      amount: 50,
      payment_method: 'credit_card',
      status: 'paid',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await paymentRepository.create({
      amount: 100,
      payment_method: 'pix',
      status: 'paid',
      user: {
        connect: { id: 'user-02' },
      },
    })

    const { payments } = await sut.execute({
      user_id: 'user-01',
    })

    expect(payments).toHaveLength(1)
    expect(payments[0].amount).toBe(50)
    expect(payments[0].user_id).toBe('user-01')
  })

  it('should return payments with different statuses', async () => {
    await paymentRepository.create({
      amount: 50,
      payment_method: 'credit_card',
      status: 'paid',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await paymentRepository.create({
      amount: 100,
      payment_method: 'pix',
      status: 'pending',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await paymentRepository.create({
      amount: 75,
      payment_method: 'debit_card',
      status: 'cancelled',
      user: {
        connect: { id: 'user-01' },
      },
    })

    const { payments } = await sut.execute({
      user_id: 'user-01',
    })

    expect(payments).toHaveLength(3)
    expect(payments.map((p) => p.status)).toContain('paid')
    expect(payments.map((p) => p.status)).toContain('pending')
    expect(payments.map((p) => p.status)).toContain('cancelled')
  })

  it('should return payments linked to subscriptions and products', async () => {
    await paymentRepository.create({
      amount: 49.9,
      payment_method: 'credit_card',
      status: 'paid',
      user: {
        connect: { id: 'user-01' },
      },
      subscription: {
        connect: { id: 'subscription-01' },
      },
    })

    await paymentRepository.create({
      amount: 300,
      payment_method: 'debit_card',
      status: 'paid',
      user: {
        connect: { id: 'user-01' },
      },
      product: {
        connect: { id: 'product-01' },
      },
    })

    const { payments } = await sut.execute({
      user_id: 'user-01',
    })

    expect(payments).toHaveLength(2)
    expect(payments[0].subscription_id).toBe('subscription-01')
    expect(payments[1].product_id).toBe('product-01')
  })
})
