import { Eye, EyeOff, LogIn } from 'lucide-react';
import React, { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import type { AppError } from '../../utils/errorMapping';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchMode: () => void;
  onForgotPassword: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchMode, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const showCaptcha = loginAttempts >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (showCaptcha && !captchaValue) {
      setError('Por favor, complete o reCAPTCHA');
      return;
    }

    setLoading(true);

    try {
      await onLogin(email, password);
      // Reset tentativas em caso de sucesso
      setLoginAttempts(0);
    } catch (err) {
      const appError = err as AppError;
      setError(appError.userMessage || 'Erro ao fazer login. Verifique suas credenciais.');
      // Incrementar tentativas
      setLoginAttempts(prev => prev + 1);
      // Reset captcha em caso de erro
      if (showCaptcha) {
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <svg
            className="w-12 h-12 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
              fill="currentColor"
            />
            <path
              d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Bem-vindo ao poup.app</h2>
        <p className="text-center text-gray-500 mb-8">
          Faça login para gerenciar suas assinaturas.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <input
                className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 pr-12 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="******************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 -mt-1.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={loading}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          {showCaptcha && (
            <div className="mb-6 flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                onChange={(value) => setCaptchaValue(value)}
                theme="light"
              />
            </div>
          )}

          <div className="flex items-center justify-end mb-6">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Esqueceu sua senha?
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center space-x-2 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              <LogIn size={18} />
              <span>{loading ? 'Entrando...' : 'Entrar'}</span>
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Não tem uma conta?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSwitchMode();
            }}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Crie uma agora
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
