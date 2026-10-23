import React from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { ProfessionalForm } from '../hooks/useProfissionaisPage';
import { useServices } from '@/features/services/hooks/useServices';

const INPUT_CLASS = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition';

interface Props {
  editingId: string | null;
  form: ProfessionalForm;
  setForm: React.Dispatch<React.SetStateAction<ProfessionalForm>>;
  isSaving: boolean;
  formError: string;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const ProfessionalModal: React.FC<Props> = ({
  editingId, form, setForm, isSaving, formError, onSave, onClose,
}) => {
  const { data: services = [] } = useServices();
  const toggleService = (id: string) =>
    setForm((f) => ({
      ...f,
      serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter((s) => s !== id) : [...f.serviceIds, id],
    }));

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Editar Profissional' : 'Novo Profissional'}</h2>
        <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600 transition" aria-label="Fechar"><X size={20} /></button>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        {formError && <div className="bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded-lg text-sm">{formError}</div>}

        <div>
          <label htmlFor="prof-fullName" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo <span className="text-danger-500">*</span></label>
          <input id="prof-fullName" type="text" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className={INPUT_CLASS} placeholder="Nome completo do profissional" />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-1">Função <span className="text-danger-500">*</span></legend>
          <div className="grid grid-cols-2 gap-2">
            {([['manicure', 'Manicure'], ['podologa', 'Podóloga']] as const).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={form.type === value} onClick={() => setForm((f) => ({ ...f, type: value }))}
                className={`min-h-11 rounded-lg border text-sm font-medium transition ${form.type === value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Define o perfil de acesso: só a podóloga vê dados de saúde.</p>
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prof-commission" className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label>
            <input id="prof-commission" inputMode="decimal" value={form.commissionRate} onChange={(e) => setForm((f) => ({ ...f, commissionRate: e.target.value }))} className={INPUT_CLASS} placeholder="Ex.: 40" />
          </div>
          <div>
            <label htmlFor="prof-specialty" className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
            <input id="prof-specialty" type="text" value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} className={INPUT_CLASS} placeholder="Ex.: unhas em gel" />
          </div>
        </div>

        <label htmlFor="prof-online" className="flex items-center gap-3 min-h-11 cursor-pointer">
          <input id="prof-online" type="checkbox" checked={form.acceptsOnlineBooking} onChange={(e) => setForm((f) => ({ ...f, acceptsOnlineBooking: e.target.checked }))} className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
          <span className="text-sm font-medium text-gray-700">Aceita agendamento pelo link</span>
        </label>

        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-1">Serviços que realiza</legend>
          {services.length === 0 ? (
            <p className="text-xs text-gray-500">Cadastre os serviços em Serviços primeiro.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {services.filter((s) => s.isActive).map((s) => (
                <label key={s.id} htmlFor={`prof-srv-${s.id}`} className="flex items-center gap-2 min-h-11 cursor-pointer">
                  <input id={`prof-srv-${s.id}`} type="checkbox" checked={form.serviceIds.includes(s.id)} onChange={() => toggleService(s.id)} className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
                  <span className="text-sm text-gray-700">{s.name}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prof-phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input id="prof-phone" type="text" value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} className={INPUT_CLASS} placeholder="(00) 00000-0000" />
          </div>
          <div>
            <label htmlFor="prof-email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input id="prof-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={INPUT_CLASS} placeholder="profissional@email.com" />
          </div>
        </div>

        {!editingId && (
          <>
            <hr className="border-gray-200" />
            <p className="text-sm font-medium text-gray-600">Credenciais de acesso ao sistema</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prof-username" className="block text-sm font-medium text-gray-700 mb-1">Usuário <span className="text-danger-500">*</span></label>
                <input id="prof-username" type="text" autoComplete="off" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} className={INPUT_CLASS} placeholder="usuario.profissional" />
              </div>
              <div>
                <label htmlFor="prof-password" className="block text-sm font-medium text-gray-700 mb-1">Senha <span className="text-danger-500">*</span></label>
                <input id="prof-password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className={INPUT_CLASS} placeholder="••••••••" />
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{editingId ? 'Salvar Alterações' : 'Cadastrar'}</Button>
        </div>
      </form>
    </div>
  </div>
);
};
