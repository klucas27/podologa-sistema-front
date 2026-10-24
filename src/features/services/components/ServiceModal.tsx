import React from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { usesFixed } from '../hooks/useServicosPage';
import type { ServiceForm } from '../hooks/useServicosPage';
import { useProducts } from '@/features/stock/hooks/useStock';
import type { CommissionMode } from '@/types';

const MODES: [CommissionMode, string][] = [['percent', 'Percentual'], ['fixed', 'Valor fixo'], ['percent_plus_fixed', 'Percentual + fixo']];

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

type FormProps = Pick<Props, 'form' | 'setForm'>;

const CommissionFields: React.FC<FormProps> = ({ form, setForm }) => (
  <fieldset className="space-y-3">
    <legend className="block text-sm font-medium text-gray-700 mb-1">Tipo de comissão</legend>
    <div className="grid grid-cols-3 gap-2">
      {MODES.map(([value, label]) => (
        <button key={value} type="button" aria-pressed={form.commissionMode === value}
          onClick={() => setForm((f) => ({ ...f, commissionMode: value }))}
          className={`min-h-11 rounded-lg border text-sm font-medium transition ${form.commissionMode === value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600'}`}>
          {label}
        </button>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-3">
      {form.commissionMode !== 'fixed' && (
        <div>
          <label htmlFor="srv-commission" className="block text-sm font-medium text-gray-700 mb-1">Taxa padrão (%)</label>
          <input id="srv-commission" inputMode="decimal" value={form.commissionRate} onChange={(e) => setForm((f) => ({ ...f, commissionRate: e.target.value }))} className={INPUT_CLASS} placeholder="ex.: 40" />
          <p className="mt-1 text-xs text-gray-500">Usada quando a profissional não tem taxa própria.</p>
        </div>
      )}
      {usesFixed(form.commissionMode) && (
        <div>
          <label htmlFor="srv-commission-fixed" className="block text-sm font-medium text-gray-700 mb-1">Valor fixo (R$) *</label>
          <input id="srv-commission-fixed" inputMode="decimal" value={form.commissionFixed} onChange={(e) => setForm((f) => ({ ...f, commissionFixed: e.target.value }))} className={INPUT_CLASS} placeholder="15,00" />
        </div>
      )}
    </div>
  </fieldset>
);

const ProductsFields: React.FC<FormProps> = ({ form, setForm }) => {
  const { data: products = [] } = useProducts();
  const active = products.filter((p) => p.isActive);
  const setLine = (i: number, patch: Partial<ServiceForm['products'][number]>) =>
    setForm((f) => ({ ...f, products: f.products.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));

  return (
    <fieldset className="space-y-2">
      <legend className="block text-sm font-medium text-gray-700 mb-1">Produtos usados</legend>
      <p className="text-xs text-gray-500">Saem do estoque automaticamente quando o atendimento é concluído.</p>
      {form.products.map((line, i) => {
        const unit = products.find((p) => p.id === line.productId)?.unit;
        return (
          <div key={i} className="flex items-center gap-2">
            <select aria-label={`Produto ${i + 1}`} value={line.productId} onChange={(e) => setLine(i, { productId: e.target.value })} className={`${INPUT_CLASS} flex-1 min-w-0`}>
              <option value="">Escolha o produto</option>
              {active.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input aria-label={`Quantidade ${i + 1}${unit ? ` (${unit})` : ''}`} inputMode="decimal" value={line.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} className={`${INPUT_CLASS} w-24`} placeholder={unit ?? 'qtd.'} />
            <button type="button" onClick={() => setForm((f) => ({ ...f, products: f.products.filter((_, j) => j !== i) }))} className="p-3 rounded-lg text-gray-500 hover:bg-danger-50 hover:text-danger-600" aria-label={`Remover produto ${i + 1}`}><Trash2 size={18} /></button>
          </div>
        );
      })}
      <button type="button" onClick={() => setForm((f) => ({ ...f, products: [...f.products, { productId: '', quantity: '' }] }))}
        className="flex items-center gap-1 min-h-11 px-2 text-sm font-medium text-primary-600 hover:text-primary-700">
        <Plus size={16} /> Adicionar produto
      </button>
    </fieldset>
  );
};

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="srv-duration" className="block text-sm font-medium text-gray-700 mb-1">Duração (min) *</label>
            <input id="srv-duration" inputMode="numeric" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} className={INPUT_CLASS} />
          </div>
          <div>
            <label htmlFor="srv-price" className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
            <input id="srv-price" inputMode="decimal" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={INPUT_CLASS} placeholder="35,00" />
          </div>
        </div>

        <CommissionFields form={form} setForm={setForm} />
        <ProductsFields form={form} setForm={setForm} />

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
