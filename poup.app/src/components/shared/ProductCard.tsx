import { motion } from 'framer-motion';
import { Edit2, ShoppingBag, Trash2 } from 'lucide-react';
import type { Product } from '../../interfaces';
import { cn } from '../../utils/cn';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onPay: (product: Product) => void;
  index: number;
}

const categoryColors = {
  food: {
    bg: 'from-orange-50 to-orange-100',
    badge: 'bg-orange-100 text-orange-700',
    border: 'border-orange-200',
    icon: 'text-orange-600',
  },
  transport: {
    bg: 'from-blue-50 to-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
    icon: 'text-blue-600',
  },
  entertainment: {
    bg: 'from-purple-50 to-purple-100',
    badge: 'bg-purple-100 text-purple-700',
    border: 'border-purple-200',
    icon: 'text-purple-600',
  },
  health: {
    bg: 'from-green-50 to-green-100',
    badge: 'bg-green-100 text-green-700',
    border: 'border-green-200',
    icon: 'text-green-600',
  },
  shopping: {
    bg: 'from-pink-50 to-pink-100',
    badge: 'bg-pink-100 text-pink-700',
    border: 'border-pink-200',
    icon: 'text-pink-600',
  },
  other: {
    bg: 'from-gray-50 to-gray-100',
    badge: 'bg-gray-100 text-gray-700',
    border: 'border-gray-200',
    icon: 'text-gray-600',
  },
};

const categoryLabels = {
  food: 'Alimentação',
  transport: 'Transporte',
  entertainment: 'Entretenimento',
  health: 'Saúde',
  shopping: 'Compras',
  other: 'Outros',
};

export default function ProductCard({ product, onEdit, onDelete, onPay, index }: ProductCardProps) {
  const colors = categoryColors[product.category];

  // Verificar status de pagamento
  const now = new Date();
  const nextPayment = product.next_payment ? new Date(product.next_payment) : null;

  const isFullyPaid = product.status === 'paid';
  const isOverdue = nextPayment && nextPayment < now && product.status !== 'paid';
  const isDueThisMonth =
    nextPayment &&
    nextPayment.getMonth() === now.getMonth() &&
    nextPayment.getFullYear() === now.getFullYear() &&
    product.status !== 'paid';

  const progressPercent = (product.paid_installments / product.installments) * 100;

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
          colors.border,
          isFullyPaid && 'ring-4 ring-green-300 ring-opacity-50',
          isOverdue && 'ring-4 ring-red-300 ring-opacity-50'
        )}
      >
        {/* Badges de status */}
        {(isFullyPaid || isOverdue || isDueThisMonth) && (
          <div className="relative z-10 px-4 pt-3">
            {isFullyPaid && (
              <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 w-fit">
                <span>✓</span> TOTALMENTE PAGO
              </div>
            )}
            {isOverdue && !isFullyPaid && (
              <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse w-fit">
                <span>!</span> PARCELA ATRASADA
              </div>
            )}
            {isDueThisMonth && !isOverdue && !isFullyPaid && (
              <div className="bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 w-fit">
                <span>⏰</span> VENCE ESTE MÊS
              </div>
            )}
          </div>
        )}

        {/* Background gradient */}
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', colors.bg)} />

        {/* Content */}
        <div className={cn('relative p-6', (isFullyPaid || isOverdue || isDueThisMonth) && 'pt-3')}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className={colors.icon} size={20} />
                <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
              </div>
              <span
                className={cn(
                  'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                  colors.badge
                )}
              >
                {categoryLabels[product.category]}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(product)}
                className="p-2 rounded-lg bg-white hover:bg-blue-50 text-blue-600 transition-colors duration-200 shadow-sm"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 rounded-lg bg-white hover:bg-red-50 text-red-600 transition-colors duration-200 shadow-sm"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-600">Valor Total</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(product.total_price)}
              </span>
            </div>

            {product.installments > 1 && (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-gray-600">Parcelas</span>
                  <span className="text-lg font-semibold text-gray-700">
                    {product.paid_installments}/{product.installments}x de{' '}
                    {formatCurrency(product.installment_value)}
                  </span>
                </div>

                {/* Barra de progresso */}
                <div className="relative">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-500 rounded-full',
                        progressPercent === 100
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : progressPercent > 50
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                            : 'bg-gradient-to-r from-red-400 to-red-600'
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="absolute right-0 -top-5 text-xs font-bold text-gray-700">
                    {progressPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            )}

            {product.installments > 1 && product.next_payment && (
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-gray-600">Próxima Parcela</span>
                <span className="text-sm font-semibold text-gray-700">
                  {formatDate(product.next_payment)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Data da compra</span>
                <span className="font-semibold text-gray-900">
                  {formatDate(product.purchase_date)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-600">Status</span>
                <span
                  className={cn(
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    product.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : product.status === 'partial'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  )}
                >
                  {product.status === 'paid'
                    ? 'Pago'
                    : product.status === 'partial'
                      ? 'Parcial'
                      : 'Pendente'}
                </span>
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 italic mb-3">
                  &quot;{product.description}&quot;
                </p>
              )}

              {product.status !== 'paid' && (
                <button
                  onClick={() => onPay(product)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
                >
                  Registrar Pagamento
                </button>
              )}
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
