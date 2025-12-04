import {
  BarChart2,
  Calendar,
  DollarSign,
  Home,
  LayoutDashboard,
  Package,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import Header from './components/layout/Header';
import ConfirmationModal from './components/shared/ConfirmationModal';
import PaymentModal from './components/shared/PaymentModal';
import ProductModal from './components/shared/ProductModal';
import SubscriptionModalApi from './components/shared/SubscriptionModalApi';
import { useAuth } from './hooks/useAuth';
import { usePayments } from './hooks/usePayments';
import { useProducts } from './hooks/useProducts';
import { useSubscriptions } from './hooks/useSubscriptions';
import type { Payment, Product, Subscription } from './interfaces';
import CalendarPageApi from './pages/CalendarPageApi';
import OverviewPage from './pages/OverviewPage';
import ProductsPage from './pages/ProductsPage';
import ProfilePage from './pages/ProfilePage';
import StatsPageApi from './pages/StatsPageApi';
import SubscriptionsPageApi from './pages/SubscriptionsPageApi';

type ActiveView =
  | 'overview'
  | 'subscriptions'
  | 'stats'
  | 'calendar'
  | 'products'
  | 'payments'
  | 'profile';

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
  const {
    products,
    loading: productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: refetchProducts,
  } = useProducts();
  const {
    payments,
    loading: paymentsLoading,
    createPayment,
    deletePayment,
    refetch: refetchPayments,
  } = usePayments();

  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [paymentContext, setPaymentContext] = useState<{
    subscription?: Subscription;
    product?: Product;
  } | null>(null);
  const [deletingSubscriptionId, setDeletingSubscriptionId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      refetchSubscriptions();
      refetchProducts();
      refetchPayments();
    }
  }, [user, refetchSubscriptions, refetchProducts, refetchPayments]);

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

  const handleSaveSubscription = async (
    subData: Omit<Subscription, 'id' | 'created_at' | 'user_id'>
  ) => {
    await createSubscription(subData);
  };

  const handleUpdateSubscription = async (
    id: string,
    subData: Partial<Omit<Subscription, 'id' | 'created_at' | 'user_id'>>
  ) => {
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
    if (deletingProductId !== null) {
      await deleteProduct(deletingProductId);
      setDeletingProductId(null);
    }
    if (deletingPaymentId !== null) {
      await deletePayment(deletingPaymentId);
      setDeletingPaymentId(null);
    }
  };

  const handleOpenProductModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    setDeletingProductId(id);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'user_id'>) => {
    await createProduct(productData);
  };

  const handleUpdateProduct = async (
    id: string,
    productData: Partial<Omit<Product, 'id' | 'created_at' | 'user_id'>>
  ) => {
    await updateProduct(id, productData);
  };

  const handlePayProduct = (product: Product) => {
    setPaymentContext({ product });
    setIsPaymentModalOpen(true);
  };

  const handlePaySubscription = (subscription: Subscription) => {
    setPaymentContext({ subscription });
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'user_id'>) => {
    await createPayment(paymentData);
    refetchProducts();
    refetchSubscriptions();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authMode === 'login') {
      return (
        <LoginPage
          onLogin={handleLogin}
          onSwitchMode={() => setAuthMode('signup')}
          onForgotPassword={() => setAuthMode('forgot-password')}
        />
      );
    }
    if (authMode === 'forgot-password') {
      return <ForgotPasswordPage onBackToLogin={() => setAuthMode('login')} />;
    }
    return <SignUpPage onSignUp={handleSignUp} onSwitchMode={() => setAuthMode('login')} />;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen font-sans">
      <Header onNavigate={setActiveView} onLogout={handleLogout} userName={user.name} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-2 sticky top-24">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveView('overview')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    activeView === 'overview'
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home size={20} />
                  <span className="font-medium">Geral</span>
                </button>
                <button
                  onClick={() => setActiveView('subscriptions')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    activeView === 'subscriptions'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard size={20} />
                  <span className="font-medium">Assinaturas</span>
                </button>
                <button
                  onClick={() => setActiveView('stats')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    activeView === 'stats'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart2 size={20} />
                  <span className="font-medium">Estatísticas</span>
                </button>
                <button
                  onClick={() => setActiveView('calendar')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    activeView === 'calendar'
                      ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Calendar size={20} />
                  <span className="font-medium">Calendário</span>
                </button>
                <button
                  onClick={() => setActiveView('products')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    activeView === 'products'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Package size={20} />
                  <span className="font-medium">Produtos</span>
                </button>
                <button
                  onClick={() => setActiveView('payments')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    activeView === 'payments'
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <DollarSign size={20} />
                  <span className="font-medium">Pagamentos</span>
                </button>
                <button
                  onClick={() => setActiveView('profile')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    activeView === 'profile'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User size={20} />
                  <span className="font-medium">Perfil</span>
                </button>
              </nav>
            </div>
          </aside>

          <div className="flex-1">
            {activeView === 'overview' && (
              <OverviewPage
                subscriptions={subscriptions}
                products={products}
                loading={subsLoading || productsLoading}
                onPaySubscription={handlePaySubscription}
                onPayProduct={handlePayProduct}
                onEditSubscription={handleOpenEditModal}
                onEditProduct={handleEditProduct}
                onDeleteSubscription={handleDeleteRequest}
                onDeleteProduct={handleDeleteProduct}
              />
            )}
            {activeView === 'subscriptions' && (
              <SubscriptionsPageApi
                subscriptions={subscriptions}
                loading={subsLoading}
                onAdd={handleOpenAddModal}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteRequest}
                onPay={handlePaySubscription}
              />
            )}
            {activeView === 'stats' && <StatsPageApi subscriptions={subscriptions} />}
            {activeView === 'calendar' && (
              <CalendarPageApi subscriptions={subscriptions} loading={subsLoading} />
            )}
            {activeView === 'products' && (
              <ProductsPage
                products={products}
                loading={productsLoading}
                onAdd={handleOpenProductModal}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onPay={handlePayProduct}
              />
            )}
            {activeView === 'payments' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico de Pagamentos</h2>
                {paymentsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
                    </div>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">Nenhum pagamento registrado</p>
                    <p className="text-gray-400 text-sm">
                      Registre pagamentos através das assinaturas ou produtos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {payment.subscription?.name || payment.product?.name || 'Pagamento'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.payment_date).toLocaleDateString('pt-BR')} •{' '}
                            {payment.payment_method.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(payment.amount)}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              payment.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {payment.status === 'paid'
                              ? 'Pago'
                              : payment.status === 'pending'
                                ? 'Pendente'
                                : 'Cancelado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

      {isProductModalOpen && (
        <ProductModal
          onClose={() => setIsProductModalOpen(false)}
          onSave={handleSaveProduct}
          onUpdate={handleUpdateProduct}
          editingProduct={editingProduct}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          onClose={() => setIsPaymentModalOpen(false)}
          onSave={handleSavePayment}
          subscriptions={subscriptions}
          products={products}
          preselectedSubscription={paymentContext?.subscription}
          preselectedProduct={paymentContext?.product}
        />
      )}

      {deletingSubscriptionId !== null && (
        <ConfirmationModal
          onClose={() => setDeletingSubscriptionId(null)}
          onConfirm={confirmDelete}
          message="Esta ação não pode ser desfeita. Todos os dados associados a esta assinatura serão permanentemente removidos."
        />
      )}

      {deletingProductId !== null && (
        <ConfirmationModal
          onClose={() => setDeletingProductId(null)}
          onConfirm={confirmDelete}
          message="Esta ação não pode ser desfeita. Este produto será permanentemente removido."
        />
      )}

      {deletingPaymentId !== null && (
        <ConfirmationModal
          onClose={() => setDeletingPaymentId(null)}
          onConfirm={confirmDelete}
          message="Esta ação não pode ser desfeita. Este pagamento será permanentemente removido."
        />
      )}
    </div>
  );
}
