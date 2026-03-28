import React from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { PathologyForm } from '../hooks/usePatologiasPage';

interface Props {
  editingId: string | null;
  form: PathologyForm;
  setForm: React.Dispatch<React.SetStateAction<PathologyForm>>;
  formError: string;
  isSaving: boolean;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

const PathologyModal: React.FC<Props> = ({ editingId, form, setForm, formError, isSaving, onSave, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Editar Patologia' : 'Nova Patologia'}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X size={18} /></button>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        {formError && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded-lg text-sm">{formError}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome <span className="text-danger-500">*</span></label>
          <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition" placeholder="Ex.: Onicomicose" autoFocus />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none" placeholder="Descrição opcional..." />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{editingId ? 'Salvar alterações' : 'Cadastrar'}</Button>
        </div>
      </form>
    </div>
  </div>
);

export default PathologyModal;
