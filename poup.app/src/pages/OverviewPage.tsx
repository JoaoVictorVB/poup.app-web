import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Filter,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import type { Product, Subscription } from '../interfaces';

interface OverviewPageProps {
  subscriptions: Subscription[];
  products: Product[];
  loading: boolean;
  onPaySubscription: (subscription: Subscription) => void;
  onPayProduct: (product: Product) => void;
  onEditSubscription: (subscription: Subscription) => void;
  onEditProduct: (product: Product) => void;
  onDeleteSubscription: (id: string) => void;
  onDeleteProduct: (id: string) => void;
}

type FilterType = 'all' | 'paid' | 'pending' | 'partial';
type ItemType = 'all' | 'subscriptions' | 'products';

export default function OverviewPage({
  subscriptions,
  products,
  loading,
  onPaySubscription,
  onPayProduct,
  onEditSubscription,
  onEditProduct,
  onDeleteSubscription,
  onDeleteProduct,
}: OverviewPageProps) {
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [typeFilter, setTypeFilter] = useState<ItemType>('all');

  // Combinar assinaturas e produtos em uma lista única
  const allItems = [
    ...subscriptions.map((sub) => ({
      ...sub,
      type: 'subscription' as const,
      value: sub.price,
      next_date: sub.next_payment,
      installment_info: null,
    })),
    ...products.map((prod) => ({
      ...prod,
      type: 'product' as const,
      value: prod.total_price,
      next_date: prod.next_payment,
      installment_info: `${prod.paid_installments}/${prod.installments}`,
    })),
  ];

  // Filtrar por status
  const filteredByStatus = allItems.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  // Filtrar por tipo
  const filteredItems = filteredByStatus.filter((item) => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'subscriptions') return item.type === 'subscription';
    if (typeFilter === 'products') return item.type === 'product';
    return true;
  });

  // Calcular estatísticas
  const totalPaid = allItems
    .filter((item) => item.status === 'paid')
    .reduce((acc, item) => acc + item.value, 0);

  const totalPending = allItems
    .filter((item) => item.status === 'pending' || item.status === 'partial')
    .reduce((acc, item) => {
      if (item.type === 'product' && item.status === 'partial') {
        // Para parciais, calcular apenas o que falta pagar
        const product = item as Product & { type: 'product' };
        return acc + product.installment_value * (product.installments - product.paid_installments);
      }
      return acc + item.value;
    }, 0);

  const totalSubscriptions = subscriptions.reduce((acc, sub) => acc + sub.price, 0);
  const totalProducts = products.reduce((acc, prod) => acc + prod.total_price, 0);

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
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Visão Geral</h1>
        <p className="text-blue-100">Controle completo dos seus gastos</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={24} />
            <span className="text-sm opacity-90">Pagos</span>
          </div>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              totalPaid
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock size={24} />
            <span className="text-sm opacity-90">Pendentes</span>
          </div>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              totalPending
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <CreditCard size={24} />
            <span className="text-sm opacity-90">Assinaturas</span>
          </div>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              totalSubscriptions
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag size={24} />
            <span className="text-sm opacity-90">Compras</span>
          </div>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              totalProducts
            )}
          </p>
        </motion.div>
      </div>

      {/* Filtros */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={16} className="inline mr-1" />
              Filtrar por Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="paid">Pagos</option>
              <option value="pending">Pendentes</option>
              <option value="partial">Parcialmente Pagos</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={16} className="inline mr-1" />
              Filtrar por Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ItemType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="subscriptions">Assinaturas</option>
              <option value="products">Compras</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {filteredItems.length} {filteredItems.length === 1 ? 'Item' : 'Itens'}
        </h2>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <XCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Nenhum item encontrado</p>
            <p className="text-gray-400 text-sm">Tente ajustar os filtros</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Ícone */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      item.type === 'subscription'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-purple-500 to-purple-600'
                    }`}
                  >
                    {item.type === 'subscription' ? (
                      <CreditCard size={24} className="text-white" />
                    ) : (
                      <ShoppingBag size={24} className="text-white" />
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{item.type === 'subscription' ? 'Assinatura' : 'Compra'}</span>
                      {item.installment_info && (
                        <>
                          <span>•</span>
                          <span>{item.installment_info} parcelas</span>
                        </>
                      )}
                      {item.next_date && (
                        <>
                          <span>•</span>
                          <span>
                            Próximo: {new Date(item.next_date).toLocaleDateString('pt-BR')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Valor */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(item.value)}
                    </p>
                    {item.type === 'product' && item.installment_info && (
                      <p className="text-sm text-gray-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format((item as any).installment_value)}
                        /mês
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'partial'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status === 'paid'
                        ? 'Pago'
                        : item.status === 'partial'
                          ? 'Parcial'
                          : 'Pendente'}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 ml-4">
                  {item.status !== 'paid' && (
                    <button
                      onClick={() =>
                        item.type === 'subscription'
                          ? onPaySubscription(item as any)
                          : onPayProduct(item as any)
                      }
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
                    >
                      <DollarSign size={16} className="inline mr-1" />
                      Pagar
                    </button>
                  )}
                  <button
                    onClick={() =>
                      item.type === 'subscription'
                        ? onEditSubscription(item as any)
                        : onEditProduct(item as any)
                    }
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      item.type === 'subscription'
                        ? onDeleteSubscription(item.id)
                        : onDeleteProduct(item.id)
                    }
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
