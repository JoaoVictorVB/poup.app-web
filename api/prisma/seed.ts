import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  await prisma.payment.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.subscription.deleteMany({})
  await prisma.calendarEvent.deleteMany({})
  await prisma.user.deleteMany({})
  console.log('✅ Dados anteriores removidos')

  const password = await hash('123456', 6)
  
  // Criar usuários
  const john = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: password,
    },
  })

  const jane = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password_hash: password,
    },
  })

  console.log('✅ Usuários criados:', john.email, jane.email)

  console.log('✅ Usuários criados:', john.email, jane.email)

  // Criar assinaturas para John
  const johnSubscriptions = await Promise.all([
    prisma.subscription.create({
      data: {
        name: 'Netflix',
        price: 39.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-12-05'),
        status: 'paid',
        user_id: john.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'Spotify',
        price: 19.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-12-10'),
        status: 'paid',
        user_id: john.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'Amazon Prime',
        price: 14.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-12-15'),
        status: 'pending',
        user_id: john.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'Microsoft 365',
        price: 379.00,
        billing_cycle: 'yearly',
        next_payment: new Date('2026-01-01'),
        status: 'paid',
        user_id: john.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'HBO Max',
        price: 27.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-12-20'),
        status: 'pending',
        user_id: john.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'YouTube Premium',
        price: 24.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-12-25'),
        status: 'paid',
        user_id: john.id,
      },
    }),
  ])

  // Criar assinaturas para Jane
  const janeSubscriptions = await Promise.all([
    prisma.subscription.create({
      data: {
        name: 'Disney+',
        price: 33.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-12-07'),
        status: 'paid',
        user_id: jane.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'Adobe Creative Cloud',
        price: 89.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-12-12'),
        status: 'paid',
        user_id: jane.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'Dropbox Plus',
        price: 499.00,
        billing_cycle: 'yearly',
        next_payment: new Date('2026-02-01'),
        status: 'pending',
        user_id: jane.id,
      },
    }),
    prisma.subscription.create({
      data: {
        name: 'Apple One',
        price: 44.90,
        billing_cycle: 'monthly',
        next_payment: new Date('2025-12-18'),
        status: 'paid',
        user_id: jane.id,
      },
    }),
  ])

  console.log('✅ Assinaturas criadas:', johnSubscriptions.length + janeSubscriptions.length)

  console.log('✅ Assinaturas criadas:', johnSubscriptions.length + janeSubscriptions.length)

  // Criar produtos para John
  const johnProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        category: 'shopping',
        total_price: 7200.00,
        installments: 12,
        paid_installments: 3,
        installment_value: 600.00,
        purchase_date: new Date('2025-08-15'),
        next_payment: new Date('2025-12-15'),
        status: 'partial',
        description: 'iPhone 15 Pro 256GB',
        user_id: john.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Notebook Dell',
        category: 'shopping',
        total_price: 4800.00,
        installments: 10,
        paid_installments: 10,
        installment_value: 480.00,
        purchase_date: new Date('2025-01-10'),
        next_payment: null,
        status: 'paid',
        description: 'Dell Inspiron 15',
        user_id: john.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smart TV Samsung 55"',
        category: 'shopping',
        total_price: 3600.00,
        installments: 8,
        paid_installments: 5,
        installment_value: 450.00,
        purchase_date: new Date('2025-06-01'),
        next_payment: new Date('2025-12-01'),
        status: 'partial',
        description: 'TV 4K UHD',
        user_id: john.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Academia Fitness',
        category: 'health',
        total_price: 1200.00,
        installments: 12,
        paid_installments: 0,
        installment_value: 100.00,
        purchase_date: new Date('2025-11-01'),
        next_payment: new Date('2025-12-01'),
        status: 'pending',
        description: 'Plano anual',
        user_id: john.id,
      },
    }),
  ])

  // Criar produtos para Jane
  const janeProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'MacBook Air M2',
        category: 'shopping',
        total_price: 9600.00,
        installments: 12,
        paid_installments: 6,
        installment_value: 800.00,
        purchase_date: new Date('2025-05-20'),
        next_payment: new Date('2025-12-20'),
        status: 'partial',
        description: 'MacBook Air 256GB',
        user_id: jane.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Curso de Design',
        category: 'entertainment',
        total_price: 2400.00,
        installments: 6,
        paid_installments: 6,
        installment_value: 400.00,
        purchase_date: new Date('2025-05-01'),
        next_payment: null,
        status: 'paid',
        description: 'Curso online completo',
        user_id: jane.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Plano Odontológico',
        category: 'health',
        total_price: 1800.00,
        installments: 12,
        paid_installments: 2,
        installment_value: 150.00,
        purchase_date: new Date('2025-09-01'),
        next_payment: new Date('2025-12-01'),
        status: 'partial',
        description: 'Plano familiar',
        user_id: jane.id,
      },
    }),
  ])

  console.log('✅ Produtos criados:', johnProducts.length + janeProducts.length)

  // Criar pagamentos para assinaturas do John
  const subscriptionPayments = await Promise.all([
    // Pagamentos Netflix
    prisma.payment.create({
      data: {
        amount: 39.90,
        payment_date: new Date('2025-10-05'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Pagamento automático',
        user_id: john.id,
        subscription_id: johnSubscriptions[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 39.90,
        payment_date: new Date('2025-11-05'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Pagamento automático',
        user_id: john.id,
        subscription_id: johnSubscriptions[0].id,
      },
    }),
    // Pagamentos Spotify
    prisma.payment.create({
      data: {
        amount: 19.90,
        payment_date: new Date('2025-10-10'),
        payment_method: 'pix',
        status: 'paid',
        user_id: john.id,
        subscription_id: johnSubscriptions[1].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 19.90,
        payment_date: new Date('2025-11-10'),
        payment_method: 'pix',
        status: 'paid',
        user_id: john.id,
        subscription_id: johnSubscriptions[1].id,
      },
    }),
    // Pagamento YouTube Premium
    prisma.payment.create({
      data: {
        amount: 24.90,
        payment_date: new Date('2025-11-25'),
        payment_method: 'debit_card',
        status: 'paid',
        user_id: john.id,
        subscription_id: johnSubscriptions[5].id,
      },
    }),
    // Pagamentos Disney+ (Jane)
    prisma.payment.create({
      data: {
        amount: 33.90,
        payment_date: new Date('2025-10-07'),
        payment_method: 'credit_card',
        status: 'paid',
        user_id: jane.id,
        subscription_id: janeSubscriptions[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 33.90,
        payment_date: new Date('2025-11-07'),
        payment_method: 'credit_card',
        status: 'paid',
        user_id: jane.id,
        subscription_id: janeSubscriptions[0].id,
      },
    }),
  ])

  // Criar pagamentos para produtos
  const productPayments = await Promise.all([
    // iPhone - 3 parcelas pagas
    prisma.payment.create({
      data: {
        amount: 600.00,
        payment_date: new Date('2025-09-15'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 1/12',
        user_id: john.id,
        product_id: johnProducts[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 600.00,
        payment_date: new Date('2025-10-15'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 2/12',
        user_id: john.id,
        product_id: johnProducts[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 600.00,
        payment_date: new Date('2025-11-15'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 3/12',
        user_id: john.id,
        product_id: johnProducts[0].id,
      },
    }),
    // Smart TV - 5 parcelas pagas
    prisma.payment.create({
      data: {
        amount: 450.00,
        payment_date: new Date('2025-07-01'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 1/8',
        user_id: john.id,
        product_id: johnProducts[2].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 450.00,
        payment_date: new Date('2025-08-01'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 2/8',
        user_id: john.id,
        product_id: johnProducts[2].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 450.00,
        payment_date: new Date('2025-09-01'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 3/8',
        user_id: john.id,
        product_id: johnProducts[2].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 450.00,
        payment_date: new Date('2025-10-01'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 4/8',
        user_id: john.id,
        product_id: johnProducts[2].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 450.00,
        payment_date: new Date('2025-11-01'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 5/8',
        user_id: john.id,
        product_id: johnProducts[2].id,
      },
    }),
    // MacBook - 6 parcelas pagas (Jane)
    prisma.payment.create({
      data: {
        amount: 800.00,
        payment_date: new Date('2025-06-20'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 1/12',
        user_id: jane.id,
        product_id: janeProducts[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 800.00,
        payment_date: new Date('2025-07-20'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 2/12',
        user_id: jane.id,
        product_id: janeProducts[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 800.00,
        payment_date: new Date('2025-08-20'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 3/12',
        user_id: jane.id,
        product_id: janeProducts[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 800.00,
        payment_date: new Date('2025-09-20'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 4/12',
        user_id: jane.id,
        product_id: janeProducts[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 800.00,
        payment_date: new Date('2025-10-20'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 5/12',
        user_id: jane.id,
        product_id: janeProducts[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 800.00,
        payment_date: new Date('2025-11-20'),
        payment_method: 'credit_card',
        status: 'paid',
        notes: 'Parcela 6/12',
        user_id: jane.id,
        product_id: janeProducts[0].id,
      },
    }),
    // Plano Odontológico - 2 parcelas pagas (Jane)
    prisma.payment.create({
      data: {
        amount: 150.00,
        payment_date: new Date('2025-10-01'),
        payment_method: 'debit_card',
        status: 'paid',
        notes: 'Parcela 1/12',
        user_id: jane.id,
        product_id: janeProducts[2].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 150.00,
        payment_date: new Date('2025-11-01'),
        payment_method: 'debit_card',
        status: 'paid',
        notes: 'Parcela 2/12',
        user_id: jane.id,
        product_id: janeProducts[2].id,
      },
    }),
  ])

  console.log('✅ Pagamentos criados:', subscriptionPayments.length + productPayments.length)

  // Criar eventos de calendário
  const calendarEvents = await Promise.all([
    prisma.calendarEvent.create({
      data: {
        title: 'Pagamento Netflix',
        date: new Date('2025-12-05'),
        type: 'payment',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Pagamento Spotify',
        date: new Date('2025-12-10'),
        type: 'payment',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Pagamento Amazon Prime',
        date: new Date('2025-12-15'),
        type: 'payment',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Parcela iPhone',
        date: new Date('2025-12-15'),
        type: 'payment',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Parcela Smart TV',
        date: new Date('2025-12-01'),
        type: 'payment',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Parcela MacBook',
        date: new Date('2025-12-20'),
        type: 'payment',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Revisar assinaturas',
        date: new Date('2025-12-01'),
        type: 'reminder',
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Comparar planos de streaming',
        date: new Date('2025-12-15'),
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

  console.log('✅ Eventos de calendário criados:', calendarEvents.length)
  
  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('📊 Resumo:')
  console.log(`   - ${2} usuários (john@example.com / jane@example.com)`)
  console.log(`   - ${johnSubscriptions.length + janeSubscriptions.length} assinaturas`)
  console.log(`   - ${johnProducts.length + janeProducts.length} produtos`)
  console.log(`   - ${subscriptionPayments.length + productPayments.length} pagamentos`)
  console.log(`   - ${calendarEvents.length} eventos de calendário`)
  console.log('\n🔑 Credenciais de teste:')
  console.log('   Email: john@example.com ou jane@example.com')
  console.log('   Senha: 123456\n')
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