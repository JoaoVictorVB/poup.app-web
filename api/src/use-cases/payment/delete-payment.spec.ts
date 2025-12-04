import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryPaymentRepository } from '../../repositories/in-memory/in-memory-payment-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { DeletePaymentUseCase } from './delete-payment'

let paymentRepository: InMemoryPaymentRepository
let sut: DeletePaymentUseCase

describe('Delete Payment Use Case', () => {
  beforeEach(() => {
    paymentRepository = new InMemoryPaymentRepository()
    sut = new DeletePaymentUseCase(paymentRepository)
  })

  it('should be able to delete a payment', async () => {
    const payment = await paymentRepository.create({
      amount: 100,
      payment_method: 'pix',
      status: 'paid',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await sut.execute({
      payment_id: payment.id,
      user_id: 'user-01',
    })

    const deletedPayment = await paymentRepository.findById(payment.id)

    expect(deletedPayment).toBeNull()
  })

  it('should throw ResourceNotFoundError when payment does not exist', async () => {
    await expect(() =>
      sut.execute({
        payment_id: 'non-existing-payment',
        user_id: 'user-01',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should throw ResourceNotFoundError when user does not own the payment (IDOR protection)', async () => {
    const payment = await paymentRepository.create({
      amount: 50,
      payment_method: 'credit_card',
      status: 'paid',
      user: {
        connect: { id: 'user-01' },
      },
    })

    await expect(() =>
      sut.execute({
        payment_id: payment.id,
        user_id: 'user-02', // Different user trying to delete
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
