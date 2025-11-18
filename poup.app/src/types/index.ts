// src/types/index.ts

/**
 * Define as categorias possíveis para uma assinatura.
 */
export type SubscriptionCategory =
  | 'Entretenimento'
  | 'Produtividade'
  | 'Tecnologia'
  | 'Serviços em Nuvem'
  | 'Outro';

/**
 * Define as moedas suportadas pela aplicação.
 */
export type Currency = 'EUR' | 'USD' | 'BRL';

/**
 * Define a frequência de pagamento de uma assinatura.
 */
export type PaymentFrequency = 'Mensal' | 'Anual' | '2 anos' | '5 anos';

/**
 * Define os métodos de pagamento aceitos.
 */
export type PaymentMethod = 'PayPal' | 'Cartão de Crédito' | 'Apple Pay' | 'Mastercard';

/**
 * Interface principal que descreve a estrutura de um objeto de assinatura.
 */
export interface Subscription {
  id: number;
  name: string;
  logo: string;
  category: SubscriptionCategory;
  cost: number;
  currency: Currency;
  paymentFrequency: PaymentFrequency;
  nextPayment: string; // Formato YYYY-MM-DD
  paymentMethod: PaymentMethod;
  paidBy: string;
  url: string;
  notes: string;
}

/**
 * Define as visualizações/páginas possíveis na navegação principal.
 */
export type ActiveView = 'subscriptions' | 'stats' | 'calendar' | 'profile';
