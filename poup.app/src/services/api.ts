import axios from 'axios';
import type {
  AuthResponse,
  CalendarEvent,
  CalendarEventResponse,
  CalendarEventsResponse,
  Subscription,
  SubscriptionResponse,
  SubscriptionsResponse,
  User,
  UserResponse,
} from '../interfaces';
import { handleApiError, isAuthError } from '../utils/errorMapping';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@PoupApp:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const appError = handleApiError(error);
    
    if (isAuthError(appError)) {
      localStorage.removeItem('@PoupApp:token');
    }
    
    return Promise.reject(appError);
  }
);

export const authService = {
  async signUp(name: string, email: string, password: string): Promise<User> {
    const { data } = await api.post<UserResponse>('/users', { name, email, password });
    return data.user;
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/sessions', { email, password });
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<UserResponse>('/me');
    return data.user;
  },
};

export const subscriptionService = {
  async getAll(): Promise<Subscription[]> {
    const { data } = await api.get<SubscriptionsResponse>('/subscriptions');
    return data.subscriptions;
  },

  async create(subscription: Omit<Subscription, 'id' | 'created_at' | 'user_id'>): Promise<Subscription> {
    const { data } = await api.post<SubscriptionResponse>('/subscriptions', subscription);
    return data.subscription;
  },

  async update(id: string, subscription: Partial<Omit<Subscription, 'id' | 'created_at' | 'user_id'>>): Promise<Subscription> {
    const { data } = await api.put<SubscriptionResponse>(`/subscriptions/${id}`, subscription);
    return data.subscription;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/subscriptions/${id}`);
  },
};

export const calendarService = {
  async getAll(): Promise<CalendarEvent[]> {
    const { data } = await api.get<CalendarEventsResponse>('/calendar');
    return data.events;
  },

  async create(event: Omit<CalendarEvent, 'id' | 'created_at'>): Promise<CalendarEvent> {
    const { data } = await api.post<CalendarEventResponse>('/calendar', event);
    return data.event;
  },

  async update(id: string, event: Partial<Omit<CalendarEvent, 'id' | 'created_at'>>): Promise<CalendarEvent> {
    const { data } = await api.put<CalendarEventResponse>(`/calendar/${id}`, event);
    return data.event;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/calendar/${id}`);
  },
};

export default api;