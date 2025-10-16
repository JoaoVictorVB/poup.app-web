import React, { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { Subscription } from '../interfaces';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

interface StatsPageApiProps {
  subscriptions: Subscription[];
}

const StatsPageApi: React.FC<StatsPageApiProps> = ({ subscriptions }) => {
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
    const data = subscriptions.reduce((acc, sub) => {
      const cycle = sub.billing_cycle === 'monthly' ? 'Mensal' : 'Anual';
      if (!acc[cycle]) {
        acc[cycle] = 0;
      }
      acc[cycle] += 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  const costByBillingCycle = useMemo(() => {
    const data = subscriptions.reduce((acc, sub) => {
      const cycle = sub.billing_cycle === 'monthly' ? 'Mensal' : 'Anual';
      if (!acc[cycle]) {
        acc[cycle] = 0;
      }
      acc[cycle] += sub.price;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  const upcomingPayments = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return subscriptions
      .filter(sub => {
        const paymentDate = new Date(sub.next_payment);
        return paymentDate >= today && paymentDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.next_payment).getTime() - new Date(b.next_payment).getTime());
  }, [subscriptions]);

  const formatCurrency = (value: number) => {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-4xl font-bold text-blue-600">{subscriptions.length}</p>
            <p className="text-gray-500 mt-2">Assinaturas Ativas</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-4xl font-bold text-green-600">
              {formatCurrency(totalMonthlyCost)}
            </p>
            <p className="text-gray-500 mt-2">Custo Mensal</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-4xl font-bold text-purple-600">
              {formatCurrency(totalYearlyCost)}
            </p>
            <p className="text-gray-500 mt-2">Custo Anual</p>
          </div>
        </div>
      </div>

      {/* Próximos Pagamentos */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Próximos Pagamentos (30 dias)
        </h2>
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
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Data
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">
                      Valor
                    </th>
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

          {/* Gráfico de Custos por Ciclo */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-4 text-center">
              Custos por Ciclo de Pagamento
            </h3>
            {costByBillingCycle.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={costByBillingCycle}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value || 0)}`}
                      outerRadius={100}
                      fill="#82ca9d"
                      dataKey="value"
                      nameKey="name"
                    >
                      {costByBillingCycle.map((_, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default StatsPageApi;
