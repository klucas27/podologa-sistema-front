import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footprints, User, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [professionalName, setProfessionalName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/api/auth/register', {
        username,
        password,
        professionalName: professionalName || undefined,
      });

      // Após registro, reusar fluxo de login para popular o contexto
      await signIn(username, password);

      navigate('/dashboard');
    } catch (err) {
      const message = (err as any)?.message || 'Erro ao registrar. Tente novamente.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitting = isSubmitting || isLoading;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500 text-white mb-4">
            <Footprints size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">PodoSistema</h1>
          <p className="text-sm text-gray-400 mt-1">Crie sua conta</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Usuário */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Usuário
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu.usuario"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
          </div>

          {/* Nome profissional (opcional) */}
          <div>
            <label htmlFor="professionalName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome profissional (opcional)
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="professionalName"
                type="text"
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                placeholder="Dra. Ana Paula"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
          </div>

          {/* Confirmar senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar senha
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 focus:ring-2 focus:ring-primary-300 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? 'Criando...' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
