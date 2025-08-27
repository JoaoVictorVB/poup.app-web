import { BarChart2, Calendar, LayoutDashboard, User } from 'lucide-react';
import { useState } from 'react';

// Importando tipos e dados
import { MOCK_SUBSCRIPTIONS } from './data/mocs';
import type { ActiveView, Subscription } from './types';

// Importando componentes de página
import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import Header from './components/layout/Header';
import CalendarPage from './pages/CalendarPage';
import StatsPage from './pages/StatsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';

// Importando componentes compartilhados (modais)
import ConfirmationModal from './components/shared/ConfirmationModal';
import SubscriptionModal from './components/shared/SubscriptionModal';
import ProfilePage from './pages/ProfilePage';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeView, setActiveView] = useState<ActiveView>('subscriptions');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deletingSubscriptionId, setDeletingSubscriptionId] = useState<number | null>(null);

  const handleLogin = () => setIsLoggedIn(true);
  const handleSignUp = () => setIsLoggedIn(true);
  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveView('subscriptions');
    setAuthMode('login');
  };

  const handleOpenAddModal = () => { setEditingSubscription(null); setIsModalOpen(true); };
  const handleOpenEditModal = (sub: Subscription) => { setEditingSubscription(sub); setIsModalOpen(true); };

  const handleSaveSubscription = (subData: Omit<Subscription, 'id'> | Subscription) => {
    if ('id' in subData) {
      setSubscriptions(prev => prev.map(s => s.id === subData.id ? subData : s));
    } else {
      const newId = Math.max(...subscriptions.map(s => s.id), 0) + 1;
      setSubscriptions(prev => [...prev, { ...subData, id: newId }]);
    }
  };

  const handleDeleteRequest = (id: number) => setDeletingSubscriptionId(id);
  const confirmDelete = () => {
    if (deletingSubscriptionId !== null) {
      setSubscriptions(prev => prev.filter(s => s.id !== deletingSubscriptionId));
      setDeletingSubscriptionId(null);
    }
  };

  if (!isLoggedIn) {
    if (authMode === 'login') {
      return <LoginPage onLogin={handleLogin} onSwitchMode={() => setAuthMode('signup')} />;
    }
    return <SignUpPage onSignUp={handleSignUp} onSwitchMode={() => setAuthMode('login')} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header onNavigate={setActiveView} onLogout={handleLogout} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/5">
            <nav className="space-y-2">
              <button onClick={() => setActiveView('subscriptions')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${activeView === 'subscriptions' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}><LayoutDashboard size={20} /><span>Assinaturas</span></button>
              <button onClick={() => setActiveView('stats')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${activeView === 'stats' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}><BarChart2 size={20} /><span>Estatísticas</span></button>
              <button onClick={() => setActiveView('calendar')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${activeView === 'calendar' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}><Calendar size={20} /><span>Calendário</span></button>
              <button onClick={() => setActiveView('profile')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${activeView === 'profile' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}><User size={20} /><span>Perfil</span></button>
            </nav>
          </aside>
          <div className="flex-1">
            {activeView === 'subscriptions' && <SubscriptionsPage subscriptions={subscriptions} onAdd={handleOpenAddModal} onEdit={handleOpenEditModal} onDelete={handleDeleteRequest} />}
            {activeView === 'stats' && <StatsPage subscriptions={subscriptions} />}
            {activeView === 'calendar' && <CalendarPage subscriptions={subscriptions} />}
            {activeView === 'profile' && <ProfilePage onLogout={handleLogout} />}
          </div>
        </div>
      </main>
      {isModalOpen && <SubscriptionModal onClose={() => setIsModalOpen(false)} onSave={handleSaveSubscription} editingSubscription={editingSubscription} />}
      {deletingSubscriptionId !== null && <ConfirmationModal onClose={() => setDeletingSubscriptionId(null)} onConfirm={confirmDelete} message="Esta ação não pode ser desfeita. Todos os dados associados a esta assinatura serão permanentemente removidos." />}
    </div>
  );
}