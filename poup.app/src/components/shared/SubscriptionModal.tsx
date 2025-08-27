import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Subscription } from '../../types';

interface SubscriptionModalProps {
  onClose: () => void;
  onSave: (sub: Omit<Subscription, 'id'> | Subscription) => void;
  editingSubscription: Subscription | null;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSave, editingSubscription }) => {
    const [formData, setFormData] = useState<Omit<Subscription, 'id'>>({ name: '', logo: '', category: 'Outro', cost: 0, currency: 'EUR', paymentFrequency: 'Mensal', nextPayment: new Date().toISOString().split('T')[0], paymentMethod: 'Cartão de Crédito', paidBy: '', url: '', notes: '' });
    
    useEffect(() => {
        if (editingSubscription) {
            setFormData(editingSubscription);
        }
    }, [editingSubscription]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const dataToSave = editingSubscription ? { ...formData, id: editingSubscription.id } : formData;
        onSave(dataToSave);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{editingSubscription ? 'Editar Assinatura' : 'Adicionar Assinatura'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Nome</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Preço</label><input type="number" name="cost" step="0.01" value={formData.cost} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Moeda</label><select name="currency" value={formData.currency} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"><option>EUR</option><option>USD</option><option>BRL</option></select></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700">Categoria</label><select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"><option>Produtividade</option><option>Entretenimento</option><option>Tecnologia</option><option>Serviços em Nuvem</option><option>Outro</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700">URL do Logo</label><input type="text" name="logo" value={formData.logo} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" placeholder="https://exemplo.com/logo.png" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Notas</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"></textarea></div>
                    <div className="flex justify-end pt-4"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Cancelar</button><button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Salvar</button></div>
                </form>
            </div>
        </div>
    );
};

export default SubscriptionModal;