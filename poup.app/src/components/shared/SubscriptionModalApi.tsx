import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Subscription } from '../../interfaces';
import type { AppError } from '../../utils/errorMapping';
import { ErrorMessage, FormField } from './FormComponents';

interface SubscriptionModalApiProps {
  onClose: () => void;
  onSave: (sub: Omit<Subscription, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  onUpdate: (id: string, sub: Partial<Omit<Subscription, 'id' | 'created_at' | 'user_id'>>) => Promise<void>;
  editingSubscription: Subscription | null;
}

const SubscriptionModalApi: React.FC<SubscriptionModalApiProps> = ({ 
  onClose, 
  onSave, 
  onUpdate, 
  editingSubscription 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    billing_cycle: 'monthly' as 'monthly' | 'yearly',
    next_payment: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingSubscription) {
      setFormData({
        name: editingSubscription.name,
        price: editingSubscription.price,
        billing_cycle: editingSubscription.billing_cycle,
        next_payment: editingSubscription.next_payment.split('T')[0],
      });
    }
  }, [editingSubscription]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const nextPaymentDate = new Date(formData.next_payment);
      nextPaymentDate.setHours(12, 0, 0, 0);
      
      const dataToSubmit = {
        ...formData,
        next_payment: nextPaymentDate.toISOString(),
      };

      if (editingSubscription) {
        await onUpdate(editingSubscription.id, dataToSubmit);
      } else {
        await onSave(dataToSubmit);
      }
      onClose();
    } catch (err) {
      const appError = err as AppError;
      
      if (appError.fieldErrors) {
        setFieldErrors(appError.fieldErrors);
      }
      
      setError(appError.userMessage || 'Erro ao salvar assinatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {editingSubscription ? 'Editar Assinatura' : 'Adicionar Assinatura'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <ErrorMessage 
              message={error} 
              onClose={() => setError('')}
            />
          )}

          <FormField
            label="Nome da Assinatura"
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            error={fieldErrors.name}
            placeholder="Ex: Netflix, Spotify..."
            required
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Preço (R$)"
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={handleChange}
              error={fieldErrors.price}
              required
              disabled={loading}
            />
            
            <FormField
              label="Ciclo de Pagamento"
              id="billing_cycle"
              as="select"
              value={formData.billing_cycle}
              onChange={handleChange}
              error={fieldErrors.billing_cycle}
              disabled={loading}
            >
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </FormField>
          </div>

          <FormField
            label="Próximo Pagamento"
            id="next_payment"
            type="date"
            value={formData.next_payment}
            onChange={handleChange}
            error={fieldErrors.next_payment}
            required
            disabled={loading}
          />

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionModalApi;
