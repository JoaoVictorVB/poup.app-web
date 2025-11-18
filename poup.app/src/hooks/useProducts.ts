import { useCallback, useEffect, useState } from 'react';
import type { Product } from '../interfaces';
import api from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ products: Product[] }>('/products');
      setProducts(response.data.products);
    } catch (err) {
      setError('Erro ao carregar produtos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(
    async (productData: Omit<Product, 'id' | 'created_at' | 'user_id'>) => {
      try {
        setError(null);
        const response = await api.post<{ product: Product }>('/products', productData);
        setProducts((prev) => [response.data.product, ...prev]);
        return response.data.product;
      } catch (err) {
        setError('Erro ao criar produto');
        console.error(err);
        throw err;
      }
    },
    []
  );

  const updateProduct = useCallback(
    async (id: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'user_id'>>) => {
      try {
        setError(null);
        const response = await api.put<{ product: Product }>(`/products/${id}`, productData);
        setProducts((prev) => prev.map((p) => (p.id === id ? response.data.product : p)));
        return response.data.product;
      } catch (err) {
        setError('Erro ao atualizar produto');
        console.error(err);
        throw err;
      }
    },
    []
  );

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setError(null);
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError('Erro ao deletar produto');
      console.error(err);
      throw err;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProducts();
    }
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
};
