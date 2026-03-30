import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Footprints, User, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';

/**
 * POR QUÊ a mensagem de erro é genérica ("Credenciais inválidas")?
 *
 * RISCO MITIGADO: User Enumeration Attack.
 * Se o erro dissesse "Usuário não encontrado" vs "Senha incorreta",
 * um atacante poderia descobrir quais usernames existem no sistema
 * e depois fazer brute-force apenas na senha.
 * Mensagem genérica impede essa distinção.
 */
const LoginPage: React.FC = () => {
  const [serverError, setServerError] = useState('');
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setServerError('');

    try {
      const user = await signIn(data.username, data.password);
      navigate(user.role === 'admin' ? '/dashboard' : '/pacientes');
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setServerError('Muitas tentativas de login. Aguarde antes de tentar novamente.');
      } else {
        // Mensagem genérica — nunca revelar se é usuário ou senha
        setServerError('Credenciais inválidas. Tente novamente.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500 text-white mb-4">
            <Footprints size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">PodoSistema</h1>
          <p className="text-sm text-gray-400 mt-1">Acesse sua conta para continuar</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                autoComplete="username"
                placeholder="seu.usuario"
                {...register('username')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-danger-600">{errors.username.message}</p>
            )}
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
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-danger-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 focus:ring-2 focus:ring-primary-300 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-sm text-primary-600 hover:underline"
          >
            Não tem conta? Criar conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
