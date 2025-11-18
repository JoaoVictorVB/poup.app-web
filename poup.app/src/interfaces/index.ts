export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  next_payment: string;
  status: 'paid' | 'pending' | 'cancelled';
  created_at?: string;
  user_id?: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'food' | 'transport' | 'entertainment' | 'health' | 'shopping' | 'other';
  total_price: number;
  installments: number;
  paid_installments: number;
  installment_value: number;
  purchase_date: string;
  next_payment?: string;
  description?: string;
  status: 'paid' | 'pending' | 'partial';
  created_at?: string;
  user_id?: string;
}

export interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'bank_transfer';
  status: 'paid' | 'pending' | 'cancelled';
  notes?: string;
  created_at?: string;
  user_id?: string;
  subscription_id?: string;
  product_id?: string;
  subscription?: Subscription;
  product?: Product;
}

export interface FinancialReport {
  total_spent: number;
  monthly_average: number;
  yearly_projection: number;
  subscriptions_total: number;
  products_total: number;
  payments_by_method: Record<string, number>;
  payments_by_status: Record<string, number>;
  spending_by_category: Record<string, number>;
  upcoming_payments: Array<{
    id: string;
    name: string;
    amount: number;
    due_date: string;
    type: 'subscription' | 'pending_payment';
  }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'payment' | 'reminder';
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
  message: string;
}

export interface UserResponse {
  user: User;
  message?: string;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
}

export interface SubscriptionResponse {
  subscription: Subscription;
}

export interface ProductsResponse {
  products: Product[];
}

export interface ProductResponse {
  product: Product;
}

export interface PaymentsResponse {
  payments: Payment[];
}

export interface PaymentResponse {
  payment: Payment;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
}

export interface CalendarEventResponse {
  event: CalendarEvent;
}
