import React, { useState } from 'react';
import { Plus, Pencil, KeyRound, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ROLE_LABELS } from '@/config/permissions';
import { useUsers, useCreateUser, useUpdateUser, useResetPassword, generateTemporaryPassword } from '../hooks/useUsers';
import { UserModal, type UserFormValues } from '../components/UserModal';
import type { ManagedUser } from '../services/user.service';

const errorMessage = (err: unknown, fallback: string) => (err as { message?: string })?.message || fallback;

const UsuariosPage: React.FC = () => {
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const resetPassword = useResetPassword();
  const [modal, setModal] = useState<{ editing: ManagedUser | null } | null>(null);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState<{ username: string; password: string } | null>(null);

  const close = () => { setModal(null); setError(''); };

  const save = (values: UserFormValues) => {
    setError('');
    const onError = (err: unknown) => setError(errorMessage(err, 'Erro ao salvar usuário.'));
    if (modal?.editing) {
      updateUser.mutate(
        { id: modal.editing.id, data: { role: values.role, professionalId: values.professionalId, isActive: values.isActive } },
        { onSuccess: close, onError },
      );
    } else {
      createUser.mutate(
        { username: values.username, password: values.password, role: values.role, professionalId: values.professionalId },
        { onSuccess: close, onError },
      );
    }
  };

  const reset = (u: ManagedUser) => {
    if (!window.confirm(`Gerar uma nova senha temporária para ${u.username}?`)) return;
    const password = generateTemporaryPassword();
    resetPassword.mutate(
      { id: u.id, password },
      { onSuccess: () => setTempPassword({ username: u.username, password }), onError: (err) => window.alert(errorMessage(err, 'Erro ao redefinir senha.')) },
    );
  };

  return (
    <ErrorBoundary featureName="Usuários">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
            <p className="text-sm text-gray-500">Quem entra no sistema e o que cada perfil pode ver.</p>
          </div>
          <Button icon={<Plus size={16} />} onClick={() => setModal({ editing: null })}>Novo usuário</Button>
        </div>

        {tempPassword && (
          <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Senha temporária de <strong>{tempPassword.username}</strong>: <code className="font-mono text-base select-all">{tempPassword.password}</code>
            <span className="block text-xs mt-1">Anote agora — ela não será mostrada de novo.</span>
            <button type="button" className="mt-2 underline" onClick={() => setTempPassword(null)}>Ocultar</button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 size={24} className="animate-spin text-primary-500" /></div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-4 px-4 py-3 sm:px-6">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {u.username}
                      {!u.isActive && <span className="ml-2 text-xs font-normal text-gray-400">(inativo)</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ROLE_LABELS[u.role]}{u.professionalName ? ` · ${u.professionalName}` : ''}
                    </p>
                  </div>
                  {u.role !== 'admin' && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button type="button" onClick={() => reset(u)} className="p-3 rounded-lg text-gray-500 hover:bg-primary-50 hover:text-primary-600" aria-label={`Redefinir senha de ${u.username}`}><KeyRound size={18} /></button>
                      <button type="button" onClick={() => setModal({ editing: u })} className="p-3 rounded-lg text-gray-500 hover:bg-primary-50 hover:text-primary-600" aria-label={`Editar ${u.username}`}><Pencil size={18} /></button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {modal && (
          <UserModal key={modal.editing?.id ?? 'new'} editing={modal.editing} isSaving={createUser.isPending || updateUser.isPending}
            error={error} onSave={save} onClose={close} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default UsuariosPage;
