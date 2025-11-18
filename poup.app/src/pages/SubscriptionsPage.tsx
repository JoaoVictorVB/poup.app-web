import { ChevronDown, Edit2, Filter, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import type { Subscription } from '../types';

interface SubscriptionsPageProps {
  subscriptions: Subscription[];
  onAdd: () => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: number) => void;
}

const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({
  subscriptions,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nova Assinatura</span>
        </button>
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
            <button className="border border-gray-300 p-2.5 rounded-lg text-gray-600 hover:bg-gray-100">
              <ChevronDown size={20} />
            </button>
            <button className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b last:border-b-0 hover:bg-gray-50 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={sub.logo}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/40x40/e0e0e0/757575?text=?';
                        }}
                        alt={`${sub.name} logo`}
                        className="w-10 h-10 object-contain"
                      />
                      <span className="font-semibold text-gray-800">{sub.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 hidden md:table-cell">{sub.paymentFrequency}</td>
                  <td className="p-4 text-gray-600 hidden lg:table-cell">
                    {new Date(sub.nextPayment).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4 font-semibold text-right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: sub.currency,
                    }).format(sub.cost)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(sub)}
                        className="p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(sub.id)}
                        className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
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
    </div>
  );
};

export default SubscriptionsPage;
