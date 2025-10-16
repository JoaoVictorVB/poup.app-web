import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('123456', 6)
  
  const john = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: password,
    },
  })

  const jane = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password_hash: password,
    },
  })

  const johnSubscriptions = await Promise.all([
    prisma.subscription.create({
      data: {
        name: 'Netflix',
        price: 39.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-11-05'),
        user_id: john.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'Spotify',
        price: 19.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-11-10'),
        user_id: john.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'Amazon Prime',
        price: 14.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-11-15'),
        user_id: john.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'Microsoft 365',
        price: 379.00,
        billing_cycle: 'yearly',
        next_payment: new Date('2026-01-01'),
        user_id: john.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'HBO Max',
        price: 27.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-11-20'),
        user_id: john.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'YouTube Premium',
        price: 24.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-11-25'),
        user_id: john.id,
      },
    }),
  ])

  const janeSubscriptions = await Promise.all([
    prisma.subscription.create({
      data: {
        name: 'Disney+',
        price: 33.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-11-07'),
        user_id: jane.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'Adobe Creative Cloud',
        price: 89.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-11-12'),
        user_id: jane.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'Dropbox Plus',
        price: 499.00,
        billing_cycle: 'yearly',
        next_payment: new Date('2026-02-01'),
        user_id: jane.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'Apple One',
        price: 44.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-11-18'),
        user_id: jane.id,
      },
    }),
  ])

  const calendarEvents = await Promise.all([
    prisma.calendarEvent.create({
      data: {
        title: 'Pagamento Netflix',
        date: new Date('2025-11-05'),
        type: 'payment',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Pagamento Spotify',
        date: new Date('2025-11-10'),
        type: 'payment',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Pagamento Disney+',
        date: new Date('2025-11-07'),
        type: 'payment',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Pagamento Adobe CC',
        date: new Date('2025-11-12'),
        type: 'payment',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Revisar assinaturas',
        date: new Date('2025-11-01'),
        type: 'reminder',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Comparar planos de streaming',
        date: new Date('2025-11-15'),
        type: 'reminder',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Renovação anual Microsoft 365',
        date: new Date('2026-01-01'),
        type: 'reminder',
      },
    }),
  ])

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })