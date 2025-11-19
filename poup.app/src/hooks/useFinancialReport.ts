import { useCallback, useEffect, useState } from 'react';
import type { FinancialReport } from '../interfaces';
import api from '../services/api';

export const useFinancialReport = (startDate?: Date, endDate?: Date) => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching financial report...');

      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate.toISOString());
      if (endDate) params.append('end_date', endDate.toISOString());

      const url = `/reports/financial${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('📡 API URL:', url);

      const response = await api.get<FinancialReport>(url);

      console.log('✅ Financial report received:', response.data);

      setReport(response.data);
    } catch (err) {
      console.error('❌ Error fetching financial report:', err);
      setError('Erro ao carregar relatório financeiro');
    } finally {
      setLoading(false);
      console.log('🏁 Finished loading financial report');
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const token = localStorage.getItem('@PoupApp:token');
    console.log('🔑 Token check:', token ? 'Token exists' : 'No token found');

    if (token) {
      fetchReport();
    } else {
      setLoading(false);
      console.log('⚠️ No token, skipping fetch');
    }
  }, [fetchReport]);

  return {
    report,
    loading,
    error,
    refetch: fetchReport,
  };
};
