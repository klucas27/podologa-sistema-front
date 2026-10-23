import React from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { ServiceForm } from '../hooks/useServicosPage';

const INPUT_CLASS = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition';

interface Props {
  editingId: string | null;
  form: ServiceForm;
  setForm: React.Dispatch<React.SetStateAction<ServiceForm>>;
  isSaving: boolean;
  formError: string;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

const Toggle: React.FC<{ id: string; label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }> = ({ id, label, hint, checked, onChange }) => (
  <label htmlFor={id} className="flex items-start gap-3 min-h-11 cursor-pointer">
    <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
    <span>
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      {hint && <span className="block text-xs text-gray-500">{hint}</span>}
    </span>
  </label>
);

export const ServiceModal: React.FC<Props> = ({ editingId, form, setForm, isSaving, formError, onSave, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" role="presentation">
    <div role="dialog" aria-modal="true" aria-labelledby="service-modal-title" className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full max-w-lg sm:mx-4 p-6 max-h-[90dvh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 id="service-modal-title" className="text-lg font-bold text-gray-800">{editingId ? 'Editar serviço' : 'Novo serviço'}</h2>
        <button type="button" onClick={onClose} className="p-2 -m-2 rounded text-gray-400 hover:text-gray-600" aria-label="Fechar"><X size={20} /></button>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        {formError && <div role="alert" className="bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded-lg text-sm">{formError}</div>}

        <div>
          <label htmlFor="srv-name" className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input id="srv-name" type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={INPUT_CLASS} placeholder="Ex.: Manicure, Pé e mão, Esmaltação em gel" />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-1">Categoria *</legend>
          <div className="grid grid-cols-2 gap-2">
            {([['estetica', 'Estética'], ['podologia', 'Podologia']] as const).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={form.category === value}
                onClick={() => setForm((f) => ({ ...f, category: value, requiresAnamnesis: value === 'podologia' ? true : f.requiresAnamnesis }))}
                className={`min-h-11 rounded-lg border text-sm font-medium transition ${form.category === value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="srv-duration" className="block text-sm font-medium text-gray-700 mb-1">Duração (min) *</label>
            <input id="srv-duration" inputMode="numeric" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} className={INPUT_CLASS} />
          </div>
          <div>
            <label htmlFor="srv-price" className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
            <input id="srv-price" inputMode="decimal" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={INPUT_CLASS} placeholder="35,00" />
          </div>
          <div>
            <label htmlFor="srv-commission" className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label>
            <input id="srv-commission" inputMode="decimal" value={form.commissionRate} onChange={(e) => setForm((f) => ({ ...f, commissionRate: e.target.value }))} className={INPUT_CLASS} placeholder="padrão" />
          </div>
        </div>

        <Toggle id="srv-public" label="Aparece no link de agendamento" hint="As clientes podem escolher este serviço sozinhas." checked={form.isPublic} onChange={(v) => setForm((f) => ({ ...f, isPublic: v }))} />
        <Toggle id="srv-anamnesis" label="Exige anamnese" hint="Pede a ficha de saúde antes do atendimento (podologia)." checked={form.requiresAnamnesis} onChange={(v) => setForm((f) => ({ ...f, requiresAnamnesis: v }))} />
        {editingId && <Toggle id="srv-active" label="Ativo" checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{editingId ? 'Salvar' : 'Cadastrar'}</Button>
        </div>
      </form>
    </div>
  </div>
);
