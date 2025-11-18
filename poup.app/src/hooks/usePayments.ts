import { useCallback, useEffect, useState } from 'react';
import type { Payment } from '../interfaces';
import api from '../services/api';

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ payments: Payment[] }>('/payments');
      setPayments(response.data.payments);
    } catch (err) {
      setError('Erro ao carregar pagamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = useCallback(
    async (paymentData: Omit<Payment, 'id' | 'created_at' | 'user_id'>) => {
      try {
        setError(null);
        const response = await api.post<{ payment: Payment }>('/payments', paymentData);
        setPayments((prev) => [response.data.payment, ...prev]);
        return response.data.payment;
      } catch (err) {
        setError('Erro ao criar pagamento');
        console.error(err);
        throw err;
      }
    },
    []
  );

  const deletePayment = useCallback(async (id: string) => {
    try {
      setError(null);
      await api.delete(`/payments/${id}`);
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError('Erro ao deletar pagamento');
      console.error(err);
      throw err;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchPayments();
    }
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    createPayment,
    deletePayment,
    refetch: fetchPayments,
  };
};
