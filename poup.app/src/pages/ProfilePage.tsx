import { LogOut } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { User } from '../interfaces';

interface ProfilePageProps {
  onLogout: () => void;
  user: User;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout, user }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    
    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Perfil salvo:', { name, email });
        alert('Funcionalidade em desenvolvimento. Por enquanto, os dados não são salvos.');
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalhes do Perfil</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            required 
                        />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Nota:</strong> A funcionalidade de atualização de perfil está em desenvolvimento.
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Informações da Conta</h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600 font-medium">ID do Usuário:</span>
                        <span className="text-gray-800 font-mono text-sm">{user.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600 font-medium">Nome:</span>
                        <span className="text-gray-800">{user.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">Email:</span>
                        <span className="text-gray-800">{user.email}</span>
                    </div>
                </div>
            </div>

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