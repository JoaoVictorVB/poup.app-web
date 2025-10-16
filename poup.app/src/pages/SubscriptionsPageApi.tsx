import { ChevronDown, Edit2, Filter, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Subscription } from '../interfaces';

interface SubscriptionsPageApiProps {
  subscriptions: Subscription[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}

const SubscriptionsPageApi: React.FC<SubscriptionsPageApiProps> = ({ 
  subscriptions, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterCycle, setFilterCycle] = useState<'all' | 'monthly' | 'yearly'>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  let filteredSubscriptions = subscriptions.filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterCycle !== 'all') {
    filteredSubscriptions = filteredSubscriptions.filter(sub => sub.billing_cycle === filterCycle);
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
      year: 'numeric',
    });
  };

  const getBillingCycleText = (cycle: string) => {
    return cycle === 'monthly' ? 'Mensal' : 'Anual';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">Total de Assinaturas</p>
          <p className="text-2xl font-bold text-gray-800">{subscriptions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">Gasto Mensal</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyTotal)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">Gasto Anual</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(yearlyTotal)}</p>
        </div>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onAdd}
            className="bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Nova Assinatura</span>
          </button>
          {filterCycle !== 'all' && (
            <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm">
              <span>
                {filterCycle === 'monthly' ? 'Mensais' : 'Anuais'}
              </span>
              <button
                onClick={() => setFilterCycle('all')}
                className="hover:text-blue-900"
                title="Remover filtro"
              >
                ×
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <div className="flex gap-2">
            <div className="relative sort-menu-container">
              <button 
                onClick={() => {
                  setShowSortMenu(!showSortMenu);
                  setShowFilterMenu(false);
                }}
                className={`border border-gray-300 p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors ${showSortMenu ? 'bg-gray-100' : ''}`}
                title="Ordenar"
              >
                <ChevronDown size={20} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      setSortBy('name');
                      setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                      setShowSortMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span>Nome</span>
                    {sortBy === 'name' && <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('price');
                      setSortOrder(sortBy === 'price' && sortOrder === 'asc' ? 'desc' : 'asc');
                      setShowSortMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span>Preço</span>
                    {sortBy === 'price' && <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('date');
                      setSortOrder(sortBy === 'date' && sortOrder === 'asc' ? 'desc' : 'asc');
                      setShowSortMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span>Data</span>
                    {sortBy === 'date' && <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
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
                className={`p-2.5 rounded-lg transition-colors ${filterCycle !== 'all' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                title="Filtrar"
              >
                <Filter size={20} />
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      setFilterCycle('all');
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${filterCycle === 'all' ? 'bg-blue-50 text-blue-600 font-semibold' : ''}`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => {
                      setFilterCycle('monthly');
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${filterCycle === 'monthly' ? 'bg-blue-50 text-blue-600 font-semibold' : ''}`}
                  >
                    Mensais
                  </button>
                  <button
                    onClick={() => {
                      setFilterCycle('yearly');
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${filterCycle === 'yearly' ? 'bg-blue-50 text-blue-600 font-semibold' : ''}`}
                  >
                    Anuais
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de assinaturas */}
      {filteredSubscriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'Nenhuma assinatura encontrada' : 'Nenhuma assinatura cadastrada'}
          </p>
          {!searchTerm && (
            <button
              onClick={onAdd}
              className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Adicionar sua primeira assinatura
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Nome</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">
                    Ciclo
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">
                    Próximo Pagamento
                  </th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-700">Valor</th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map(sub => (
                  <tr
                    key={sub.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {sub.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-800">{sub.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 hidden md:table-cell">
                      {getBillingCycleText(sub.billing_cycle)}
                    </td>
                    <td className="p-4 text-gray-600 hidden lg:table-cell">
                      {formatDate(sub.next_payment)}
                    </td>
                    <td className="p-4 font-semibold text-right">
                      {formatCurrency(sub.price)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(sub)}
                          className="p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(sub.id)}
                          className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                          title="Deletar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPageApi;
