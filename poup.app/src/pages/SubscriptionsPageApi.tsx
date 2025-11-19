import {
  ChevronDown,
  CreditCard,
  DollarSign,
  Filter,
  Plus,
  Search,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import StatsCard from '../components/shared/StatsCard';
import SubscriptionCard from '../components/shared/SubscriptionCard';
import type { Subscription } from '../interfaces';

interface SubscriptionsPageApiProps {
  subscriptions: Subscription[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onPay?: (sub: Subscription) => void;
}

const SubscriptionsPageApi: React.FC<SubscriptionsPageApiProps> = ({
  subscriptions,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onPay,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterCycle, setFilterCycle] = useState<'all' | 'monthly' | 'yearly'>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  let filteredSubscriptions = subscriptions.filter((sub) =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterCycle !== 'all') {
    filteredSubscriptions = filteredSubscriptions.filter(
      (sub) => sub.billing_cycle === filterCycle
    );
  }

  filteredSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'price') {
      comparison = a.price - b.price;
    } else if (sortBy === 'date') {
      comparison = new Date(a.next_payment).getTime() - new Date(b.next_payment).getTime();
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.sort-menu-container') && !target.closest('.filter-menu-container')) {
        setShowSortMenu(false);
        setShowFilterMenu(false);
      }
    };

    if (showSortMenu || showFilterMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSortMenu, showFilterMenu]);

  const monthlyTotal = subscriptions.reduce((total, sub) => {
    const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : sub.price;
    return total + monthlyPrice;
  }, 0);

  const yearlyTotal = subscriptions.reduce((total, sub) => {
    const yearlyPrice = sub.billing_cycle === 'yearly' ? sub.price : sub.price * 12;
    return total + yearlyPrice;
  }, 0);

  // Estatísticas de pagamento
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Em dia: status paid e próximo pagamento no futuro
  const paidCount = subscriptions.filter((sub) => {
    if (sub.status !== 'paid') return false;
    return new Date(sub.next_payment) > now;
  }).length;

  // Vencem este mês: next_payment é neste mês e ainda não foi pago
  const dueThisMonth = subscriptions.filter((sub) => {
    if (sub.status === 'paid') return false;
    const nextPayment = new Date(sub.next_payment);
    return nextPayment.getMonth() === currentMonth && nextPayment.getFullYear() === currentYear;
  }).length;

  // Atrasadas: next_payment já passou e não foi pago
  const overdue = subscriptions.filter((sub) => {
    if (sub.status === 'paid') return false;
    return new Date(sub.next_payment) < now;
  }).length;

  // Gasto previsto para este mês (apenas o que vence este mês)
  const expectedMonthlySpending = subscriptions.reduce((total, sub) => {
    const nextPayment = new Date(sub.next_payment);
    const isThisMonth =
      nextPayment.getMonth() === currentMonth && nextPayment.getFullYear() === currentYear;
    if (isThisMonth && sub.status !== 'paid') {
      return total + sub.price;
    }
    return total;
  }, 0);

  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard
          title="Total de Assinaturas"
          value={subscriptions.length.toString()}
          icon={CreditCard}
          color="blue"
          delay={0}
        />
        <StatsCard
          title="✓ Em Dia"
          value={paidCount.toString()}
          icon={DollarSign}
          color="green"
          delay={0.05}
        />
        <StatsCard
          title="⏰ Vencem Este Mês"
          value={dueThisMonth.toString()}
          icon={TrendingUp}
          color="yellow"
          delay={0.1}
        />
        <StatsCard
          title="! Atrasadas"
          value={overdue.toString()}
          icon={TrendingUp}
          color="red"
          delay={0.15}
        />
        <StatsCard
          title="💰 Previsto Este Mês"
          value={formatCurrency(expectedMonthlySpending)}
          icon={TrendingUp}
          color="purple"
          delay={0.2}
        />
      </div>

      {/* Yearly Total Card - Separate Row */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Gasto Mensal Médio"
          value={formatCurrency(monthlyTotal)}
          icon={DollarSign}
          color="purple"
          delay={0.25}
        />
        <StatsCard
          title="Gasto Anual Estimado"
          value={formatCurrency(yearlyTotal)}
          icon={TrendingUp}
          color="orange"
          delay={0.3}
        />
      </div>

      {/* Barra de ações */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onAdd}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center space-x-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Plus size={20} />
              <span>Nova Assinatura</span>
            </button>
            {filterCycle !== 'all' && (
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium">
                <span>{filterCycle === 'monthly' ? 'Mensais' : 'Anuais'}</span>
                <button
                  onClick={() => setFilterCycle('all')}
                  className="hover:text-blue-900 font-bold text-lg leading-none"
                  title="Remover filtro"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-grow sm:w-64">
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            <div className="flex gap-2">
              <div className="relative sort-menu-container">
                <button
                  onClick={() => {
                    setShowSortMenu(!showSortMenu);
                    setShowFilterMenu(false);
                  }}
                  className={`border-2 border-gray-300 p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all hover:border-gray-400 ${showSortMenu ? 'bg-gray-50 border-gray-400' : ''}`}
                  title="Ordenar"
                >
                  <ChevronDown size={20} />
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-glow border border-gray-200 py-2 z-10 overflow-hidden">
                    <button
                      onClick={() => {
                        setSortBy('name');
                        setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                        setShowSortMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex justify-between items-center transition-colors"
                    >
                      <span className="font-medium">Nome</span>
                      {sortBy === 'name' && (
                        <span className="text-blue-600 font-bold">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('price');
                        setSortOrder(sortBy === 'price' && sortOrder === 'asc' ? 'desc' : 'asc');
                        setShowSortMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex justify-between items-center transition-colors"
                    >
                      <span className="font-medium">Preço</span>
                      {sortBy === 'price' && (
                        <span className="text-blue-600 font-bold">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('date');
                        setSortOrder(sortBy === 'date' && sortOrder === 'asc' ? 'desc' : 'asc');
                        setShowSortMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex justify-between items-center transition-colors"
                    >
                      <span className="font-medium">Data</span>
                      {sortBy === 'date' && (
                        <span className="text-blue-600 font-bold">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="relative filter-menu-container">
                <button
                  onClick={() => {
                    setShowFilterMenu(!showFilterMenu);
                    setShowSortMenu(false);
                  }}
                  className={`p-3 rounded-xl transition-all shadow-md hover:shadow-lg ${filterCycle !== 'all' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'}`}
                  title="Filtrar"
                >
                  <Filter size={20} />
                </button>
                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-glow border border-gray-200 py-2 z-10 overflow-hidden">
                    <button
                      onClick={() => {
                        setFilterCycle('all');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${filterCycle === 'all' ? 'bg-blue-50 text-blue-600 font-semibold' : 'font-medium'}`}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => {
                        setFilterCycle('monthly');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${filterCycle === 'monthly' ? 'bg-blue-50 text-blue-600 font-semibold' : 'font-medium'}`}
                    >
                      Mensais
                    </button>
                    <button
                      onClick={() => {
                        setFilterCycle('yearly');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${filterCycle === 'yearly' ? 'bg-blue-50 text-blue-600 font-semibold' : 'font-medium'}`}
                    >
                      Anuais
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de assinaturas */}
      {filteredSubscriptions.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm ? 'Nenhuma assinatura encontrada' : 'Nenhuma assinatura cadastrada'}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {searchTerm
                ? 'Tente ajustar sua pesquisa'
                : 'Comece adicionando sua primeira assinatura'}
            </p>
            {!searchTerm && (
              <button
                onClick={onAdd}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Adicionar Assinatura
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubscriptions.map((sub, index) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onEdit={onEdit}
              onDelete={onDelete}
              onPay={onPay}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPageApi;
