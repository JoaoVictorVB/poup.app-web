import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryPaymentRepository } from '../../repositories/in-memory/in-memory-payment-repository'
import { InMemoryProductRepository } from '../../repositories/in-memory/in-memory-product-repository'
import { InMemorySubscriptionRepository } from '../../repositories/in-memory/in-memory-subscription-repository'
import { CreatePaymentUseCase } from './create-payment'

let paymentRepository: InMemoryPaymentRepository
let subscriptionRepository: InMemorySubscriptionRepository
let productRepository: InMemoryProductRepository
let sut: CreatePaymentUseCase

describe('Create Payment Use Case', () => {
  beforeEach(() => {
    paymentRepository = new InMemoryPaymentRepository()
    subscriptionRepository = new InMemorySubscriptionRepository()
    productRepository = new InMemoryProductRepository()
    sut = new CreatePaymentUseCase(paymentRepository, subscriptionRepository, productRepository)
  })

  it('should be able to create a payment', async () => {
    const { payment } = await sut.execute({
      amount: 49.9,
      payment_date: new Date('2024-01-15'),
      payment_method: 'credit_card',
      status: 'paid',
      notes: 'Spotify monthly payment',
      user_id: 'user-01',
    })

    expect(payment.id).toEqual(expect.any(String))
    expect(payment.amount).toBe(49.9)
    expect(payment.payment_method).toBe('credit_card')
    expect(payment.status).toBe('paid')
    expect(payment.user_id).toBe('user-01')
  })

  it('should create payment with default values', async () => {
    const { payment } = await sut.execute({
      amount: 100,
      payment_method: 'pix',
      user_id: 'user-01',
    })

    expect(payment.status).toBe('paid')
    expect(payment.payment_date).toEqual(expect.any(Date))
    expect(payment.notes).toBeNull()
    expect(payment.subscription_id).toBeNull()
    expect(payment.product_id).toBeNull()
  })

  it('should create payment linked to subscription', async () => {
    const subscription = await subscriptionRepository.create({
      name: 'Netflix',
      price: 45.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2024-02-01'),
      user_id: 'user-01',
    })

    const { payment } = await sut.execute({
      amount: 45.9,
      payment_method: 'credit_card',
      user_id: 'user-01',
      subscription_id: subscription.id,
    })

    expect(payment.subscription_id).toBe(subscription.id)
  })

  it('should create payment linked to product', async () => {
    const product = await productRepository.create({
      name: 'Notebook',
      category: 'shopping',
      total_price: 3000,
      installments: 10,
      paid_installments: 0,
      installment_value: 300,
      status: 'pending',
      user: {
        connect: { id: 'user-01' },
      },
    })

    const { payment } = await sut.execute({
      amount: 300,
      payment_method: 'debit_card',
      user_id: 'user-01',
      product_id: product.id,
    })

    expect(payment.product_id).toBe(product.id)
  })

  it('should update subscription next_payment when payment is paid (monthly)', async () => {
    const subscription = await subscriptionRepository.create({
      name: 'Spotify',
      price: 21.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2024-01-15'),
      user_id: 'user-01',
    })

    await sut.execute({
      amount: 21.9,
      payment_method: 'credit_card',
      status: 'paid',
      user_id: 'user-01',
      subscription_id: subscription.id,
    })

    const updatedSubscription = await subscriptionRepository.findUnique({
      id: subscription.id,
    })

    expect(updatedSubscription?.status).toBe('paid')
    expect(updatedSubscription?.next_payment.getMonth()).toBe(1) // February (0-indexed)
  })

  it('should update subscription next_payment when payment is paid (yearly)', async () => {
    const currentDate = new Date('2024-06-01')

    const subscription = await subscriptionRepository.create({
      name: 'Adobe Creative Cloud',
      price: 1200,
      billing_cycle: 'yearly',
      next_payment: currentDate,
      user_id: 'user-01',
    })

    await sut.execute({
      amount: 1200,
      payment_method: 'credit_card',
      status: 'paid',
      user_id: 'user-01',
      subscription_id: subscription.id,
    })

    const updatedSubscription = await subscriptionRepository.findUnique({
      id: subscription.id,
    })

    expect(updatedSubscription?.status).toBe('paid')
    expect(updatedSubscription?.next_payment.getFullYear()).toBe(2025)
  })

  it('should NOT update subscription when payment status is not paid', async () => {
    const subscription = await subscriptionRepository.create({
      name: 'Netflix',
      price: 45.9,
      billing_cycle: 'monthly',
      next_payment: new Date('2024-01-15'),
      user_id: 'user-01',
    })

    const originalNextPayment = subscription.next_payment

    await sut.execute({
      amount: 45.9,
      payment_method: 'credit_card',
      status: 'pending',
      user_id: 'user-01',
      subscription_id: subscription.id,
    })

    const updatedSubscription = await subscriptionRepository.findUnique({
      id: subscription.id,
    })

    expect(updatedSubscription?.status).toBe('pending')
    expect(updatedSubscription?.next_payment).toEqual(originalNextPayment)
  })

  it('should update product paid_installments and status when payment is paid', async () => {
    const product = await productRepository.create({
      name: 'TV',
      category: 'shopping',
      total_price: 2400,
      installments: 12,
      paid_installments: 0,
      installment_value: 200,
      next_payment: new Date('2024-02-01'),
      status: 'pending',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await sut.execute({
      amount: 200,
      payment_method: 'credit_card',
      status: 'paid',
      user_id: 'user-01',
      product_id: product.id,
    })

    const updatedProduct = await productRepository.findById(product.id)

    expect(updatedProduct?.paid_installments).toBe(1)
    expect(updatedProduct?.status).toBe('partial')
    expect(updatedProduct?.next_payment?.getMonth()).toBe(2) // March (0-indexed)
  })

  it('should set product status to paid when all installments are paid', async () => {
    const product = await productRepository.create({
      name: 'Phone',
      category: 'shopping',
      total_price: 1000,
      installments: 2,
      paid_installments: 1,
      installment_value: 500,
      status: 'partial',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await sut.execute({
      amount: 500,
      payment_method: 'pix',
      status: 'paid',
      user_id: 'user-01',
      product_id: product.id,
    })

    const updatedProduct = await productRepository.findById(product.id)

    expect(updatedProduct?.paid_installments).toBe(2)
    expect(updatedProduct?.status).toBe('paid')
  })

  it('should NOT update product when payment status is not paid', async () => {
    const product = await productRepository.create({
      name: 'Notebook',
      category: 'shopping',
      total_price: 3000,
      installments: 10,
      paid_installments: 2,
      installment_value: 300,
      status: 'partial',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await sut.execute({
      amount: 300,
      payment_method: 'credit_card',
      status: 'pending',
      user_id: 'user-01',
      product_id: product.id,
    })

    const updatedProduct = await productRepository.findById(product.id)

    expect(updatedProduct?.paid_installments).toBe(2)
    expect(updatedProduct?.status).toBe('partial')
  })

  it('should support different payment methods', async () => {
    const methods = ['credit_card', 'debit_card', 'pix', 'cash', 'bank_transfer']

    for (const method of methods) {
      const { payment } = await sut.execute({
        amount: 100,
        payment_method: method,
        user_id: 'user-01',
      })

      expect(payment.payment_method).toBe(method)
    }
  })
})
