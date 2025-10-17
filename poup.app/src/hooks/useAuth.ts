import { useEffect, useState } from 'react';
import type { User } from '../interfaces';
import { authService } from '../services/api';
import type { AppError } from '../utils/errorMapping';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('@PoupApp:token');
    const tokenExpiry = localStorage.getItem('@PoupApp:tokenExpiry');
    
    // Verificar se o token expirou
    if (token && tokenExpiry) {
      const expiryDate = new Date(tokenExpiry);
      const now = new Date();
      
      if (now >= expiryDate) {
        // Token expirado, limpar storage
        localStorage.removeItem('@PoupApp:token');
        localStorage.removeItem('@PoupApp:tokenExpiry');
        setLoading(false);
        return;
      }
      
      // Token válido, buscar perfil
      authService.getProfile()
        .then(user => setUser(user))
        .catch(() => {
          localStorage.removeItem('@PoupApp:token');
          localStorage.removeItem('@PoupApp:tokenExpiry');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    const response = await authService.signIn(email, password);
    localStorage.setItem('@PoupApp:token', response.token);
    localStorage.setItem('@PoupApp:tokenExpiry', response.expiresAt);
    
    setUser(response.user);
  };

  const signUp = async (name: string, email: string, password: string): Promise<void> => {
    await authService.signUp(name, email, password);
    
    await signIn(email, password);
  };

  const signOut = () => {
    localStorage.removeItem('@PoupApp:token');
    localStorage.removeItem('@PoupApp:tokenExpiry');
    setUser(null);
  };

  return { user, loading, signIn, signUp, signOut };
}

export function useAuthError() {
  const handleError = (error: AppError): string => {
    return error.userMessage;
  };

  return { handleError };
}