import React from 'react';
import { Plus, Pencil, Trash2, Loader2, Link2, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useServicosPage } from '../hooks/useServicosPage';
import { ServiceModal } from '../components/ServiceModal';
import type { Service } from '@/types';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** "40%", "R$ 15,00" ou "40% + R$ 5,00"; null quando não há regra própria. */
function commissionLabel(s: Pick<Service, 'commissionMode' | 'commissionRate' | 'commissionFixed'>): string | null {
  const rate = s.commissionRate !== null ? `${s.commissionRate}%` : null;
  const fixed = s.commissionFixed !== null ? brl(s.commissionFixed) : null;
  if (s.commissionMode === 'fixed') return fixed;
  if (s.commissionMode === 'percent_plus_fixed') return [rate ?? 'taxa da profissional', fixed].filter(Boolean).join(' + ');
  return rate;
}

const ServicosPage: React.FC = () => {
  const h = useServicosPage();

  return (
    <ErrorBoundary featureName="Serviços">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Serviços</h1>
            <p className="text-sm text-gray-500">Duração e preço usados na agenda e no link de agendamento.</p>
          </div>
          {h.canEdit && <Button icon={<Plus size={16} />} onClick={h.openCreate}>Novo serviço</Button>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {h.isLoading ? (
            <div className="flex items-center justify-center p-12"><Loader2 size={24} className="animate-spin text-primary-500" /></div>
          ) : h.services.length === 0 ? (
            <p className="p-8 text-center text-gray-400 text-sm">Nenhum serviço cadastrado.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {h.services.map((s) => (
                <li key={s.id} className="flex items-center gap-4 px-4 py-3 sm:px-6">
                  <span className={`w-2 self-stretch rounded-full ${s.category === 'podologia' ? 'bg-primary-700' : 'bg-primary-300'}`} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {s.name}
                      {!s.isActive && <span className="ml-2 text-xs font-normal text-gray-400">(inativo)</span>}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-gray-500">
                      <span>{s.category === 'podologia' ? 'Podologia' : 'Estética'}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{s.durationMinutes} min</span>
                      <span className="font-medium text-gray-700">{brl(s.price)}</span>
                      {commissionLabel(s) && <span>Comissão: {commissionLabel(s)}</span>}
                      {s.isPublic && <span className="flex items-center gap-1 text-primary-600"><Link2 size={12} />no link</span>}
                    </div>
                  </div>
                  {h.canEdit && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button type="button" onClick={() => h.openEdit(s)} className="p-3 rounded-lg text-gray-500 hover:bg-primary-50 hover:text-primary-600" aria-label={`Editar ${s.name}`}><Pencil size={18} /></button>
                      <button type="button" onClick={() => h.handleDelete(s)} className="p-3 rounded-lg text-gray-500 hover:bg-danger-50 hover:text-danger-600" aria-label={`Remover ${s.name}`}><Trash2 size={18} /></button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {h.modalOpen && (
          <ServiceModal editingId={h.editingId} form={h.form} setForm={h.setForm} isSaving={h.isSaving}
            formError={h.formError} onSave={h.handleSave} onClose={h.closeModal} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ServicosPage;
