import React from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Props {
  title: string;
  error: string;
  isSaving: boolean;
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  children: React.ReactNode;
}

/** Moldura comum dos formulários de estoque (folha inferior no celular, central no iPad/desktop). */
export const StockModal: React.FC<Props> = ({ title, error, isSaving, submitLabel, onSubmit, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" role="presentation">
    <div role="dialog" aria-modal="true" aria-label={title} className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full max-w-lg sm:mx-4 p-6 max-h-[90dvh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <button type="button" onClick={onClose} className="p-2 -m-2 rounded text-gray-400 hover:text-gray-600" aria-label="Fechar"><X size={20} /></button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <div role="alert" className="bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
        {children}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{submitLabel}</Button>
        </div>
      </form>
    </div>
  </div>
);

export const Field: React.FC<{ id: string; label: string; children: React.ReactNode }> = ({ id, label, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);
