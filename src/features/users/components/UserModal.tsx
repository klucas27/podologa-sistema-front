import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ROLE_LABELS } from '@/config/permissions';
import { useActiveProfessionals } from '@/features/professionals/hooks/useProfessionals';
import type { ManagedUser, StaffRole } from '../services/user.service';

const INPUT = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none';
const STAFF_ROLES: StaffRole[] = ['recepcao', 'manicure', 'podologa'];

export interface UserFormValues {
  username: string;
  password: string;
  role: StaffRole;
  professionalId: string | null;
  isActive: boolean;
}

interface Props {
  editing: ManagedUser | null;
  isSaving: boolean;
  error: string;
  onSave: (values: UserFormValues) => void;
  onClose: () => void;
}

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

export const UserModal: React.FC<Props> = ({ editing, isSaving, error, onSave, onClose }) => {
  const { data: professionals = [] } = useActiveProfessionals();
  const [values, setValues] = useState<UserFormValues>(() => ({
    username: editing?.username ?? '',
    password: '',
    role: (editing?.role === 'admin' ? 'recepcao' : editing?.role) ?? 'recepcao',
    professionalId: editing?.professionalId ?? null,
    isActive: editing?.isActive ?? true,
  }));
  const [localError, setLocalError] = useState('');

  // Profissional vinculada precisa ter a mesma função do perfil
  const options = professionals.filter((p) => p.type === values.role);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!editing && values.username.trim().length < 3) return setLocalError('Usuário deve ter ao menos 3 caracteres.');
    if (!editing && !PASSWORD_RULE.test(values.password)) return setLocalError('Senha: mínimo 8 caracteres, com letra e número.');
    if (values.role !== 'recepcao' && !values.professionalId) return setLocalError('Selecione a profissional vinculada.');
    onSave({ ...values, professionalId: values.role === 'recepcao' ? null : values.professionalId });
  };

  const shownError = localError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="user-modal-title" className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full max-w-lg sm:mx-4 p-6 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 id="user-modal-title" className="text-lg font-bold text-gray-800">{editing ? `Editar ${editing.username}` : 'Novo usuário'}</h2>
          <button type="button" onClick={onClose} className="p-2 -m-2 text-gray-400 hover:text-gray-600" aria-label="Fechar"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {shownError && <div role="alert" className="bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded-lg text-sm">{shownError}</div>}

          {!editing && (
            <>
              <div>
                <label htmlFor="usr-username" className="block text-sm font-medium text-gray-700 mb-1">Usuário *</label>
                <input id="usr-username" autoCapitalize="none" autoComplete="off" value={values.username}
                  onChange={(e) => setValues((v) => ({ ...v, username: e.target.value.trim() }))} className={INPUT} placeholder="ex.: recepcao.maria" />
              </div>
              <div>
                <label htmlFor="usr-password" className="block text-sm font-medium text-gray-700 mb-1">Senha inicial *</label>
                <input id="usr-password" type="password" autoComplete="new-password" value={values.password}
                  onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))} className={INPUT} />
                <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres, com letra e número.</p>
              </div>
            </>
          )}

          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-1">Perfil *</legend>
            <div className="grid grid-cols-3 gap-2">
              {STAFF_ROLES.map((r) => (
                <button key={r} type="button" aria-pressed={values.role === r}
                  onClick={() => setValues((v) => ({ ...v, role: r, professionalId: null }))}
                  className={`min-h-11 rounded-lg border text-sm font-medium ${values.role === r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </fieldset>

          {values.role !== 'recepcao' && (
            <div>
              <label htmlFor="usr-professional" className="block text-sm font-medium text-gray-700 mb-1">Profissional vinculada *</label>
              <select id="usr-professional" value={values.professionalId ?? ''} className={`${INPUT} bg-white`}
                onChange={(e) => setValues((v) => ({ ...v, professionalId: e.target.value || null }))}>
                <option value="">Selecione...</option>
                {options.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
              {options.length === 0 && <p className="text-xs text-gray-500 mt-1">Cadastre a profissional em Profissionais primeiro.</p>}
            </div>
          )}

          {editing && (
            <label htmlFor="usr-active" className="flex items-center gap-3 min-h-11 cursor-pointer">
              <input id="usr-active" type="checkbox" checked={values.isActive}
                onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))}
                className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
              <span className="text-sm font-medium text-gray-700">Ativo (pode entrar no sistema)</span>
            </label>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving}>{editing ? 'Salvar' : 'Criar usuário'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
