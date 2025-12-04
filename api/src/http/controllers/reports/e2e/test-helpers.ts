import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import request from 'supertest'

export async function setupTestApp() {
  await app.ready()
}

export async function cleanupTestApp() {
  await app.close()
  await new Promise((resolve) => setTimeout(resolve, 500))
}

export async function resetDatabase() {
  // Delete all data in reverse order of dependencies
  await prisma.payment.deleteMany()
  await prisma.product.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.calendarEvent.deleteMany()
  await prisma.user.deleteMany()
}

export async function createAuthenticatedUser(email: string, password: string) {
  // Create user
  await request(app.server).post('/users').send({
    name: 'Test User',
    email,
    password,
  })

  // Authenticate
  const authResponse = await request(app.server).post('/sessions').send({
    email,
    password,
  })

  return authResponse.body.token
}
