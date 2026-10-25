import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { homePathFor } from '@/config/permissions';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { settingsService } from '@/features/settings/services/settings.service';
import { PASSWORD_RULE, passwordRuleError } from '../schemas/auth.schema';

const inputClass =
  'w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition';

/** Troca obrigatória da senha provisória (criada ou redefinida pelo admin). */
const TrocarSenhaPage: React.FC = () => {
  const { role, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    const ruleError = passwordRuleError(newPassword);
    if (ruleError) {
      setError(ruleError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      await settingsService.changePassword({ currentPassword, newPassword });
      useAuthStore.getState().setMustChangePassword(false);
      navigate(homePathFor(role), { replace: true });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Erro ao alterar senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-display text-primary-700">Crie sua senha</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          {user?.mustChangePassword
            ? 'Você entrou com uma senha provisória. Defina uma senha só sua para continuar.'
            : 'Defina uma nova senha.'}
        </p>

        {error && (
          <div role="alert" className="mb-4 p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Senha atual</label>
            <input id="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input id="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} aria-describedby="password-rule" />
            <p id="password-rule" className="mt-1 text-xs text-gray-500">{PASSWORD_RULE}</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
            <input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full min-h-[44px]">Salvar nova senha</Button>
          <Button type="button" variant="ghost" onClick={signOut} className="w-full min-h-[44px]">Sair</Button>
        </form>
      </div>
    </div>
  );
};

export default TrocarSenhaPage;
