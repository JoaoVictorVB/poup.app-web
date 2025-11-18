import { ChevronDown, Filter, Package, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductCard from '../components/shared/ProductCard';
import StatsCard from '../components/shared/StatsCard';
import type { Product } from '../interfaces';

interface ProductsPageProps {
  products: Product[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onPay: (product: Product) => void;
}

export default function ProductsPage({
  products,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onPay,
}: ProductsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<'all' | Product['category']>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  let filteredProducts = products.filter((prod) =>
    prod.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterCategory !== 'all') {
    filteredProducts = filteredProducts.filter((prod) => prod.category === filterCategory);
  }

  filteredProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'price') {
      comparison = a.total_price - b.total_price;
    } else if (sortBy === 'date') {
      comparison = new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime();
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.sort-menu-container') && !target.closest('.filter-menu-container')) {
        setShowSortMenu(false);
        setShowFilterMenu(false);
      }
    };

    if (showSortMenu || showFilterMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSortMenu, showFilterMenu]);

  const totalSpent = products.reduce((total, prod) => total + prod.total_price, 0);
  const totalItems = products.reduce((total, prod) => total + prod.installments, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total de Produtos"
          value={products.length}
          icon={Package}
          color="blue"
          delay={0}
        />
        <StatsCard
          title="Itens Comprados"
          value={totalItems}
          icon={Package}
          color="purple"
          delay={0.1}
        />
        <StatsCard
          title="Total Gasto"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            totalSpent
          )}
          icon={Package}
          color="orange"
          delay={0.2}
        />
      </div>

      {/* Barra de ações */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onAdd}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center space-x-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Plus size={20} />
              <span>Novo Produto</span>
            </button>
            {filterCategory !== 'all' && (
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium">
                <span>{filterCategory}</span>
                <button
                  onClick={() => setFilterCategory('all')}
                  className="hover:text-blue-900 font-bold text-lg leading-none"
                  title="Remover filtro"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-grow sm:w-64">
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            <div className="flex gap-2">
              <div className="relative sort-menu-container">
                <button
                  onClick={() => {
                    setShowSortMenu(!showSortMenu);
                    setShowFilterMenu(false);
                  }}
                  className={`border-2 border-gray-300 p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all hover:border-gray-400 ${showSortMenu ? 'bg-gray-50 border-gray-400' : ''}`}
                  title="Ordenar"
                >
                  <ChevronDown size={20} />
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-glow border border-gray-200 py-2 z-10 overflow-hidden">
                    <button
                      onClick={() => {
                        setSortBy('name');
                        setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                        setShowSortMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex justify-between items-center transition-colors"
                    >
                      <span className="font-medium">Nome</span>
                      {sortBy === 'name' && (
                        <span className="text-blue-600 font-bold">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('price');
                        setSortOrder(sortBy === 'price' && sortOrder === 'asc' ? 'desc' : 'asc');
                        setShowSortMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex justify-between items-center transition-colors"
                    >
                      <span className="font-medium">Preço</span>
                      {sortBy === 'price' && (
                        <span className="text-blue-600 font-bold">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('date');
                        setSortOrder(sortBy === 'date' && sortOrder === 'asc' ? 'desc' : 'asc');
                        setShowSortMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex justify-between items-center transition-colors"
                    >
                      <span className="font-medium">Data</span>
                      {sortBy === 'date' && (
                        <span className="text-blue-600 font-bold">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="relative filter-menu-container">
                <button
                  onClick={() => {
                    setShowFilterMenu(!showFilterMenu);
                    setShowSortMenu(false);
                  }}
                  className={`p-3 rounded-xl transition-all shadow-md hover:shadow-lg ${filterCategory !== 'all' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'}`}
                  title="Filtrar"
                >
                  <Filter size={20} />
                </button>
                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-glow border border-gray-200 py-2 z-10 overflow-hidden">
                    <button
                      onClick={() => {
                        setFilterCategory('all');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${filterCategory === 'all' ? 'bg-blue-50 text-blue-600 font-semibold' : 'font-medium'}`}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => {
                        setFilterCategory('food');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${filterCategory === 'food' ? 'bg-blue-50 text-blue-600 font-semibold' : 'font-medium'}`}
                    >
                      Alimentação
                    </button>
                    <button
                      onClick={() => {
                        setFilterCategory('transport');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${filterCategory === 'transport' ? 'bg-blue-50 text-blue-600 font-semibold' : 'font-medium'}`}
                    >
                      Transporte
                    </button>
                    <button
                      onClick={() => {
                        setFilterCategory('entertainment');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${filterCategory === 'entertainment' ? 'bg-blue-50 text-blue-600 font-semibold' : 'font-medium'}`}
                    >
                      Entretenimento
                    </button>
                    <button
                      onClick={() => {
                        setFilterCategory('health');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${filterCategory === 'health' ? 'bg-blue-50 text-blue-600 font-semibold' : 'font-medium'}`}
                    >
                      Saúde
                    </button>
                    <button
                      onClick={() => {
                        setFilterCategory('shopping');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${filterCategory === 'shopping' ? 'bg-blue-50 text-blue-600 font-semibold' : 'font-medium'}`}
                    >
                      Compras
                    </button>
                    <button
                      onClick={() => {
                        setFilterCategory('other');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${filterCategory === 'other' ? 'bg-blue-50 text-blue-600 font-semibold' : 'font-medium'}`}
                    >
                      Outros
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de produtos */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {searchTerm
                ? 'Tente ajustar sua pesquisa'
                : 'Comece adicionando seu primeiro produto'}
            </p>
            {!searchTerm && (
              <button
                onClick={onAdd}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Adicionar Produto
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              onPay={onPay}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
