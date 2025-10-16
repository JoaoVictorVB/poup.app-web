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
  created_at?: string;
  user_id?: string;
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
}

export interface UserResponse {
  user: User;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
}

export interface SubscriptionResponse {
  subscription: Subscription;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
}

export interface CalendarEventResponse {
  event: CalendarEvent;
}