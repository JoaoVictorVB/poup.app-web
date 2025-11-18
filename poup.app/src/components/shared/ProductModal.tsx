import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '../../interfaces';

interface ProductModalProps {
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  onUpdate: (
    id: string,
    productData: Partial<Omit<Product, 'id' | 'created_at' | 'user_id'>>
  ) => Promise<void>;
  editingProduct: Product | null;
}

const categories = [
  { value: 'food', label: 'Alimentação' },
  { value: 'transport', label: 'Transporte' },
  { value: 'entertainment', label: 'Entretenimento' },
  { value: 'health', label: 'Saúde' },
  { value: 'shopping', label: 'Compras' },
  { value: 'other', label: 'Outros' },
];

export default function ProductModal({
  onClose,
  onSave,
  onUpdate,
  editingProduct,
}: ProductModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('other');
  const [totalPrice, setTotalPrice] = useState('');
  const [installments, setInstallments] = useState('1');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const installmentValue =
    totalPrice && installments ? parseFloat(totalPrice) / parseInt(installments) : 0;

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setTotalPrice(editingProduct.total_price.toString());
      setInstallments(editingProduct.installments.toString());
      setPurchaseDate(editingProduct.purchase_date.split('T')[0]);
      setDescription(editingProduct.description || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setPurchaseDate(today);
    }
  }, [editingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const numInstallments = parseInt(installments);
      const price = parseFloat(totalPrice);
      const purchaseDateObj = new Date(purchaseDate);

      // Calcular próxima data de pagamento (primeira parcela é no mês seguinte)
      const nextPayment = new Date(purchaseDateObj);
      nextPayment.setMonth(nextPayment.getMonth() + 1);

      const productData = {
        name,
        category,
        total_price: price,
        installments: numInstallments,
        paid_installments: editingProduct?.paid_installments || 0,
        installment_value: price / numInstallments,
        purchase_date: purchaseDate,
        next_payment: nextPayment.toISOString(),
        description: description || undefined,
        status:
          (editingProduct?.paid_installments || 0) === 0
            ? ('pending' as const)
            : (editingProduct?.paid_installments || 0) === numInstallments
              ? ('paid' as const)
              : ('partial' as const),
      };

      if (editingProduct) {
        await onUpdate(editingProduct.id, productData);
      } else {
        await onSave(productData);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Product['category'])}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parcelas</label>
              <input
                type="number"
                min="1"
                max="48"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {installmentValue > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Valor por parcela:</span>{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  installmentValue
                )}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data da Compra</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Adicione detalhes sobre o produto..."
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? 'Salvando...' : editingProduct ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
