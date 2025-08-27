// src/pages/ProfilePage.tsx

import { LogOut } from 'lucide-react';
import React, { useState } from 'react';
import type { Currency } from '../types';

interface ProfilePageProps {
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
    const [name, setName] = useState('bellamy');
    const [email, setEmail] = useState('bellamy@example.com');
    const [currency, setCurrency] = useState<Currency>('EUR');

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        // Em um app real, aqui você chamaria a API para salvar os dados
        console.log('Perfil salvo:', { name, email });
        alert('Perfil salvo com sucesso!');
    };

    const handleSavePreferences = (e: React.FormEvent) => {
        e.preventDefault();
        // Em um app real, aqui você chamaria a API para salvar as preferências
        console.log('Preferências salvas:', { currency });
        alert('Preferências salvas com sucesso!');
    };

    return (
        <div className="space-y-8">
            {/* Seção de Detalhes do Perfil */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalhes do Perfil</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" required />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Salvar Alterações</button>
                    </div>
                </form>
            </div>

            {/* Seção de Preferências */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Preferências</h2>
                <form onSubmit={handleSavePreferences} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Moeda Padrão</label>
                        <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2">
                            <option>EUR</option>
                            <option>USD</option>
                            <option>BRL</option>
                        </select>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Salvar Preferências</button>
                    </div>
                </form>
            </div>

            {/* Seção de Logout */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Sair</h2>
                <p className="text-gray-600 mb-4">Clique no botão abaixo para encerrar sua sessão.</p>
                <button onClick={onLogout} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2">
                    <LogOut size={18} />
                    <span>Sair da Conta</span>
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;