import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Footprints, User, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api, ApiError } from '@/services/api';
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema';

const RegisterPage: React.FC = () => {
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      professionalName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    setServerError('');
    setIsSubmitting(true);

    try {
      await api.post('/api/auth/register', {
        username: data.username,
        password: data.password,
        professionalName: data.professionalName || undefined,
      });

      // Após registro, reusar fluxo de login para popular o contexto
      await signIn(data.username, data.password);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('Erro ao registrar. Tente novamente.');
      }
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
                placeholder="Dra. Ana Paula"
                {...register('professionalName')}
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
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-danger-600">{errors.password.message}</p>
            )}
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
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-danger-600">{errors.confirmPassword.message}</p>
            )}
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
