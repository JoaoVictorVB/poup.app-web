import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Payment, Product, Subscription } from '../../interfaces';

interface PaymentModalProps {
  onClose: () => void;
  onSave: (paymentData: Omit<Payment, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  subscriptions?: Subscription[];
  products?: Product[];
  preselectedSubscription?: Subscription;
  preselectedProduct?: Product;
}

const paymentMethods = [
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'bank_transfer', label: 'Transferência Bancária' },
];

export default function PaymentModal({
  onClose,
  onSave,
  subscriptions = [],
  products = [],
  preselectedSubscription,
  preselectedProduct,
}: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Payment['payment_method']>('pix');
  const [status, setStatus] = useState<Payment['status']>('paid');
  const [notes, setNotes] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setPaymentDate(today);

    if (preselectedSubscription) {
      setSubscriptionId(preselectedSubscription.id);
      setAmount(preselectedSubscription.price.toString());
    }

    if (preselectedProduct) {
      setProductId(preselectedProduct.id);
      setAmount(preselectedProduct.installment_value.toString());
    }
  }, [preselectedSubscription, preselectedProduct]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar valor
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    } else if (amountValue > 100000) {
      newErrors.amount = 'Valor não pode ser maior que R$ 100.000';
    }

    // Validar data
    if (!paymentDate) {
      newErrors.paymentDate = 'Data de pagamento é obrigatória';
    } else {
      const dateObj = new Date(paymentDate);
      if (isNaN(dateObj.getTime())) {
        newErrors.paymentDate = 'Data inválida';
      }
    }

    // Validar relação (subscription ou product)
    if (!subscriptionId && !productId) {
      newErrors.relation = 'Selecione uma assinatura ou produto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      setErrorMessage('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        amount: parseFloat(amount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        status,
        notes: notes || undefined,
        subscription_id: subscriptionId || undefined,
        product_id: productId || undefined,
      };

      await onSave(paymentData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Registrar Pagamento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {errors.relation && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span className="text-sm">{errors.relation}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                errors.amount
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data do Pagamento
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => {
                setPaymentDate(e.target.value);
                if (errors.paymentDate) setErrors((prev) => ({ ...prev, paymentDate: '' }));
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                errors.paymentDate
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {errors.paymentDate && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as Payment['payment_method'])}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Payment['status'])}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {subscriptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assinatura (opcional)
              </label>
              <select
                value={subscriptionId}
                onChange={(e) => setSubscriptionId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Nenhuma</option>
                {subscriptions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} - R$ {sub.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {products.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto (opcional)
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Nenhum</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} - R$ {prod.total_price.toFixed(2)} ({prod.installments}x de R${' '}
                    {prod.installment_value.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Adicione observações sobre o pagamento..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? 'Salvando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
