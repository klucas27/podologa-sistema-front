import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ApiError } from '@/lib/api';
import { settingsService } from '../services/settings.service';

const SecurityTab: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      await settingsService.changePassword({ currentPassword, newPassword });
      setSuccess('Senha alterada com sucesso.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Erro ao alterar senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && (
        <div className="flex items-center gap-2 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle size={16} className="flex-shrink-0" />{success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Senha atual <span className="text-danger-500">*</span></label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition" placeholder="Digite sua senha atual" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha <span className="text-danger-500">*</span></label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition" placeholder="Mínimo 6 caracteres" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha <span className="text-danger-500">*</span></label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition" placeholder="Repita a nova senha" />
      </div>
      <Button type="submit" isLoading={isLoading}>Alterar Senha</Button>
    </form>
  );
};

export default SecurityTab;
