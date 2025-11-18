import { motion } from 'framer-motion';
import { DollarSign, Edit2, Trash2 } from 'lucide-react';
import type { Subscription } from '../../interfaces';
import { cn } from '../../utils/cn';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onPay?: (subscription: Subscription) => void;
  index: number;
}

const cycleColors = {
  monthly: {
    bg: 'from-blue-50 to-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
  },
  yearly: {
    bg: 'from-purple-50 to-purple-100',
    badge: 'bg-purple-100 text-purple-700',
    border: 'border-purple-200',
  },
};

export default function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onPay,
  index,
}: SubscriptionCardProps) {
  const colors = cycleColors[subscription.billing_cycle];
  const nextPayment = new Date(subscription.next_payment);
  const daysUntil = Math.ceil((nextPayment.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border-2 shadow-soft hover:shadow-xl transition-all duration-300',
          colors.border
        )}
      >
        {/* Background gradient */}
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', colors.bg)} />

        {/* Content */}
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{subscription.name}</h3>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                    colors.badge
                  )}
                >
                  {subscription.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}
                </span>
                {subscription.status && (
                  <span
                    className={cn(
                      'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                      subscription.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : subscription.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    )}
                  >
                    {subscription.status === 'paid'
                      ? 'Pago'
                      : subscription.status === 'pending'
                        ? 'Pendente'
                        : 'Cancelado'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {onPay && subscription.status !== 'paid' && (
                <button
                  onClick={() => onPay(subscription)}
                  className="p-2 rounded-lg bg-white hover:bg-green-50 text-green-600 transition-colors duration-200 shadow-sm"
                  title="Registrar Pagamento"
                >
                  <DollarSign size={18} />
                </button>
              )}
              <button
                onClick={() => onEdit(subscription)}
                className="p-2 rounded-lg bg-white hover:bg-blue-50 text-blue-600 transition-colors duration-200 shadow-sm"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(subscription.id)}
                className="p-2 rounded-lg bg-white hover:bg-red-50 text-red-600 transition-colors duration-200 shadow-sm"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-600">Valor</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(subscription.price)}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Próximo pagamento</span>
                <span className="font-semibold text-gray-900">
                  {formatDate(subscription.next_payment)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-end">
                <span
                  className={cn(
                    'text-xs font-medium',
                    daysUntil <= 7
                      ? 'text-red-600'
                      : daysUntil <= 15
                        ? 'text-orange-600'
                        : 'text-green-600'
                  )}
                >
                  {daysUntil === 0 ? 'Hoje!' : daysUntil === 1 ? 'Amanhã' : `Em ${daysUntil} dias`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-10 -translate-y-10">
          <div
            className={cn('w-full h-full rounded-full bg-gradient-to-br opacity-20', colors.bg)}
          />
        </div>
      </div>
    </motion.div>
  );
}
