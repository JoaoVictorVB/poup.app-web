import { BarChart2, Calendar, LayoutDashboard, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import Header from './components/layout/Header';
import ConfirmationModal from './components/shared/ConfirmationModal';
import SubscriptionModalApi from './components/shared/SubscriptionModalApi';
import { useAuth } from './hooks/useAuth';
import { useSubscriptions } from './hooks/useSubscriptions';
import type { Subscription } from './interfaces';
import CalendarPageApi from './pages/CalendarPageApi';
import ProfilePage from './pages/ProfilePage';
import StatsPageApi from './pages/StatsPageApi';
import SubscriptionsPageApi from './pages/SubscriptionsPageApi';

type ActiveView = 'subscriptions' | 'stats' | 'calendar' | 'profile';

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const {
    subscriptions,
    loading: subsLoading,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    refetch: refetchSubscriptions,
  } = useSubscriptions();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeView, setActiveView] = useState<ActiveView>('subscriptions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deletingSubscriptionId, setDeletingSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      refetchSubscriptions();
    }
  }, [user, refetchSubscriptions]);

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    await signUp(name, email, password);
  };

  const handleLogout = () => {
    signOut();
    setActiveView('subscriptions');
    setAuthMode('login');
  };

  const handleOpenAddModal = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsModalOpen(true);
  };

  const handleSaveSubscription = async (subData: Omit<Subscription, 'id' | 'created_at' | 'user_id'>) => {
    await createSubscription(subData);
  };

  const handleUpdateSubscription = async (id: string, subData: Partial<Omit<Subscription, 'id' | 'created_at' | 'user_id'>>) => {
    await updateSubscription(id, subData);
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingSubscriptionId(id);
  };

  const confirmDelete = async () => {
    if (deletingSubscriptionId !== null) {
      await deleteSubscription(deletingSubscriptionId);
      setDeletingSubscriptionId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    if (authMode === 'login') {
      return <LoginPage onLogin={handleLogin} onSwitchMode={() => setAuthMode('signup')} />;
    }
    return <SignUpPage onSignUp={handleSignUp} onSwitchMode={() => setAuthMode('login')} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header onNavigate={setActiveView} onLogout={handleLogout} userName={user.name} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/5">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveView('subscriptions')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeView === 'subscriptions'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard size={20} />
                <span>Assinaturas</span>
              </button>
              <button
                onClick={() => setActiveView('stats')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeView === 'stats'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart2 size={20} />
                <span>Estatísticas</span>
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeView === 'calendar'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar size={20} />
                <span>Calendário</span>
              </button>
              <button
                onClick={() => setActiveView('profile')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeView === 'profile'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User size={20} />
                <span>Perfil</span>
              </button>
            </nav>
          </aside>

          <div className="flex-1">
            {activeView === 'subscriptions' && (
              <SubscriptionsPageApi
                subscriptions={subscriptions}
                loading={subsLoading}
                onAdd={handleOpenAddModal}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteRequest}
              />
            )}
            {activeView === 'stats' && <StatsPageApi subscriptions={subscriptions} />}
            {activeView === 'calendar' && (
              <CalendarPageApi subscriptions={subscriptions} loading={subsLoading} />
            )}
            {activeView === 'profile' && <ProfilePage onLogout={handleLogout} user={user} />}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <SubscriptionModalApi
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSubscription}
          onUpdate={handleUpdateSubscription}
          editingSubscription={editingSubscription}
        />
      )}

      {deletingSubscriptionId !== null && (
        <ConfirmationModal
          onClose={() => setDeletingSubscriptionId(null)}
          onConfirm={confirmDelete}
          message="Esta ação não pode ser desfeita. Todos os dados associados a esta assinatura serão permanentemente removidos."
        />
      )}
    </div>
  );
}