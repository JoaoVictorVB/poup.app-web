import { useEffect, useState } from 'react';
import type { User } from '../interfaces';
import { authService } from '../services/api';
import type { AppError } from '../utils/errorMapping';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('@PoupApp:token');
    if (token) {
      authService.getProfile()
        .then(user => setUser(user))
        .catch(() => {
          localStorage.removeItem('@PoupApp:token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    const token = await authService.signIn(email, password);
    localStorage.setItem('@PoupApp:token', token);
    
    const user = await authService.getProfile();
    setUser(user);
  };

  const signUp = async (name: string, email: string, password: string): Promise<void> => {
    await authService.signUp(name, email, password);
    
    await signIn(email, password);
  };

  const signOut = () => {
    localStorage.removeItem('@PoupApp:token');
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