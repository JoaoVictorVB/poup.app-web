import React, { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
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

      {/* Gráficos de Divisão */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Análise de Gastos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Gastos por Categoria */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-4 text-center">Gastos por Categoria</h3>
            {error ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-500 mb-2">Erro ao carregar dados</p>
                  <p className="text-sm text-gray-500">{error}</p>
                </div>
              </div>
            ) : spendingByCategory.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {spendingByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                {reportLoading ? 'Carregando...' : 'Sem dados para exibir'}
              </div>
            )}
          </div>

          {/* Gráfico de Pagamentos por Método */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-4 text-center">Pagamentos por Método</h3>
            {paymentsByMethod.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={paymentsByMethod}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={100}
                      fill="#82ca9d"
                      dataKey="value"
                      nameKey="name"
                    >
                      {paymentsByMethod.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                {reportLoading ? 'Carregando...' : 'Sem dados para exibir'}
              </div>
            )}
          </div>

          {/* Gráfico de Quantidade por Ciclo */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-4 text-center">
              Quantidade por Ciclo de Pagamento
            </h3>
            {billingCycleData.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={billingCycleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {billingCycleData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Sem dados para exibir
              </div>
            )}
          </div>

          {/* Gráfico de Pagamentos por Status */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-4 text-center">Pagamentos por Status</h3>
            {paymentsByStatus.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={paymentsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={100}
                      fill="#ffc658"
                      dataKey="value"
                      nameKey="name"
                    >
                      {paymentsByStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                {reportLoading ? 'Carregando...' : 'Sem dados para exibir'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPageApi;
