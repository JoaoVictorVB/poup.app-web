import React, { useMemo } from 'react';
import { useFinancialReport } from '../hooks/useFinancialReport';
import type { Subscription } from '../interfaces';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF4560',
  '#00D9FF',
  '#FF6B9D',
];

interface StatsPageApiProps {
  subscriptions: Subscription[];
}

const StatsPageApi: React.FC<StatsPageApiProps> = ({ subscriptions }) => {
  const { report, loading: reportLoading, error } = useFinancialReport();

  console.log('📊 StatsPageApi Debug:', {
    reportLoading,
    hasReport: !!report,
    error,
    report,
  });

  const totalMonthlyCost = useMemo(() => {
    return subscriptions.reduce((acc, sub) => {
      const monthlyCost = sub.billing_cycle === 'yearly' ? sub.price / 12 : sub.price;
      return acc + monthlyCost;
    }, 0);
  }, [subscriptions]);

  const totalYearlyCost = useMemo(() => {
    return subscriptions.reduce((acc, sub) => {
      const yearlyCost = sub.billing_cycle === 'yearly' ? sub.price : sub.price * 12;
      return acc + yearlyCost;
    }, 0);
  }, [subscriptions]);

  const billingCycleData = useMemo(() => {
    const data = subscriptions.reduce(
      (acc, sub) => {
        const cycle = sub.billing_cycle === 'monthly' ? 'Mensal' : 'Anual';
        if (!acc[cycle]) {
          acc[cycle] = 0;
        }
        acc[cycle] += 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  const upcomingPayments = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return subscriptions
      .filter((sub) => {
        const paymentDate = new Date(sub.next_payment);
        return paymentDate >= today && paymentDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.next_payment).getTime() - new Date(b.next_payment).getTime());
  }, [subscriptions]);

  console.log('📊 StatsPageApi Debug:', {
    reportLoading,
    hasReport: !!report,
    error,
    report,
  });

  const paymentsByMethod = useMemo(() => {
    if (!report?.payments_by_method) return [];
    return Object.entries(report.payments_by_method)
      .filter(([, amount]) => amount > 0)
      .map(([method, amount]) => ({
        name:
          method === 'credit_card'
            ? 'Cartão de Crédito'
            : method === 'debit_card'
              ? 'Cartão de Débito'
              : method === 'pix'
                ? 'PIX'
                : method === 'cash'
                  ? 'Dinheiro'
                  : 'Transferência',
        value: amount,
      }));
  }, [report]);

  const spendingByCategory = useMemo(() => {
    if (!report?.spending_by_category) return [];

    console.log('📂 Raw spending_by_category:', report.spending_by_category);

    return Object.entries(report.spending_by_category)
      .filter(([, amount]) => amount > 0)
      .map(([category, amount]) => ({
        name:
          category === 'food'
            ? 'Alimentação'
            : category === 'transport'
              ? 'Transporte'
              : category === 'entertainment'
                ? 'Entretenimento'
                : category === 'health'
                  ? 'Saúde'
                  : category === 'shopping'
                    ? 'Compras'
                    : category === 'subscriptions'
                      ? 'Assinaturas'
                      : 'Outros',
        value: amount,
      }));
  }, [report]);

  console.log('📊 Spending by category processed:', spendingByCategory);

  const paymentsByStatus = useMemo(() => {
    if (!report?.payments_by_status) return [];
    return Object.entries(report.payments_by_status)
      .filter(([, amount]) => amount > 0)
      .map(([status, amount]) => ({
        name: status === 'paid' ? 'Pago' : status === 'pending' ? 'Pendente' : 'Cancelado',
        value: amount,
      }));
  }, [report]);

  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="space-y-8">
      {/* Estatísticas Gerais */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Estatísticas Gerais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-4xl font-bold text-blue-600">{subscriptions.length}</p>
            <p className="text-gray-500 mt-2">Assinaturas Ativas</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-4xl font-bold text-green-600">{formatCurrency(totalMonthlyCost)}</p>
            <p className="text-gray-500 mt-2">Custo Mensal</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-4xl font-bold text-purple-600">{formatCurrency(totalYearlyCost)}</p>
            <p className="text-gray-500 mt-2">Custo Anual</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-4xl font-bold text-orange-600">
              {reportLoading ? '...' : formatCurrency(report?.total_spent || 0)}
            </p>
            <p className="text-gray-500 mt-2">Total Gasto</p>
          </div>
        </div>
      </div>

      {/* Próximos Pagamentos */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Próximos Pagamentos (30 dias)</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {upcomingPayments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Nenhum pagamento nos próximos 30 dias
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Assinatura
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">Data</th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingPayments.map((sub) => (
                    <tr key={sub.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="p-4 font-semibold text-gray-800">{sub.name}</td>
                      <td className="p-4 text-gray-600">{formatDate(sub.next_payment)}</td>
                      <td className="p-4 text-right font-semibold text-gray-800">
                        {formatCurrency(sub.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Análise de Gastos */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Análise de Gastos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gastos por Categoria */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-4">Gastos por Categoria</h3>
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-2">Erro ao carregar dados</p>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            ) : spendingByCategory.length > 0 ? (
              <div className="space-y-4">
                {spendingByCategory.map((item, index) => {
                  const total = spendingByCategory.reduce((sum, cat) => sum + cat.value, 0);
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.value)} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-4 border-t mt-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">
                      {formatCurrency(spendingByCategory.reduce((sum, cat) => sum + cat.value, 0))}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                {reportLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500">Carregando dados...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-500">Nenhum pagamento registrado ainda</p>
                    <p className="text-sm text-gray-400">
                      Registre pagamentos para produtos ou assinaturas para ver os gastos por
                      categoria
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagamentos por Método */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-4">Pagamentos por Método</h3>
            {paymentsByMethod.length > 0 ? (
              <div className="space-y-4">
                {paymentsByMethod.map((item, index) => {
                  const total = paymentsByMethod.reduce((sum, method) => sum + method.value, 0);
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.value)} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[(index + 2) % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-4 border-t mt-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">
                      {formatCurrency(
                        paymentsByMethod.reduce((sum, method) => sum + method.value, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                {reportLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500">Carregando dados...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-500">Nenhum pagamento registrado</p>
                    <p className="text-sm text-gray-400">
                      Clique no botão "💵 Registrar Pagamento" nas assinaturas ou produtos
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantidade por Ciclo */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-4">Distribuição por Ciclo de Pagamento</h3>
            {billingCycleData.length > 0 ? (
              <div className="space-y-4">
                {billingCycleData.map((item, index) => {
                  const total = billingCycleData.reduce((sum, cycle) => sum + cycle.value, 0);
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {item.value} assinatura{item.value !== 1 ? 's' : ''} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[(index + 4) % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="space-y-2">
                  <p className="text-gray-500">Nenhuma assinatura cadastrada</p>
                  <p className="text-sm text-gray-400">
                    Adicione assinaturas para ver a distribuição por ciclo
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pagamentos por Status */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-4">Pagamentos por Status</h3>
            {paymentsByStatus.length > 0 ? (
              <div className="space-y-4">
                {paymentsByStatus.map((item, index) => {
                  const total = paymentsByStatus.reduce((sum, status) => sum + status.value, 0);
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  const statusColors: Record<string, string> = {
                    Pago: '#10B981',
                    Pendente: '#F59E0B',
                    Cancelado: '#EF4444',
                  };
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.value)} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor:
                              statusColors[item.name] || COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-4 border-t mt-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span className="text-purple-600">
                      {formatCurrency(
                        paymentsByStatus.reduce((sum, status) => sum + status.value, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                {reportLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500">Carregando dados...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-500">Nenhum pagamento no sistema</p>
                    <p className="text-sm text-gray-400">
                      Registre pagamentos para ver a distribuição por status
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPageApi;
