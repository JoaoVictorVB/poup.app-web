import { useEffect, useState } from 'react';
import type { Subscription } from '../interfaces';
import { subscriptionService } from '../services/api';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionService.getAll();
      setSubscriptions(data);
    } catch (err) {
      setError('Erro ao carregar assinaturas');
      console.error('Erro ao buscar assinaturas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const createSubscription = async (subscription: Omit<Subscription, 'id' | 'created_at' | 'user_id'>): Promise<Subscription> => {
    try {
      const newSubscription = await subscriptionService.create(subscription);
      setSubscriptions(prev => [...prev, newSubscription]);
      return newSubscription;
    } catch (err) {
      console.error('Erro ao criar assinatura:', err);
      throw err;
    }
  };

  const updateSubscription = async (id: string, subscription: Partial<Omit<Subscription, 'id' | 'created_at' | 'user_id'>>): Promise<Subscription> => {
    try {
      const updatedSubscription = await subscriptionService.update(id, subscription);
      setSubscriptions(prev => prev.map(s => s.id === id ? updatedSubscription : s));
      return updatedSubscription;
    } catch (err) {
      console.error('Erro ao atualizar assinatura:', err);
      throw err;
    }
  };

  const deleteSubscription = async (id: string): Promise<void> => {
    try {
      await subscriptionService.delete(id);
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Erro ao deletar assinatura:', err);
      throw err;
    }
  };

  return {
    subscriptions,
    loading,
    error,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    refetch: fetchSubscriptions,
  };
}
