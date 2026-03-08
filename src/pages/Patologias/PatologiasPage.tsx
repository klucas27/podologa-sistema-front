import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  X,
  Bug,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import type { Pathology } from '@/types';

interface PathologyForm {
  name: string;
  description: string;
}

const EMPTY_FORM: PathologyForm = { name: '', description: '' };

const PatologiasPage: React.FC = () => {
  const [pathologies, setPathologies] = useState<Pathology[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PathologyForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPathologies = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ data: Pathology[] }>('/api/pathologies');
      setPathologies(res.data);
    } catch {
      setPathologies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPathologies();
  }, [fetchPathologies]);

  const filtered = pathologies.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (p: Pathology) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description ?? '' });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('O nome é obrigatório.');
      return;
    }

    setIsSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
      };

      if (editingId) {
        await api.patch(`/api/pathologies/${editingId}`, body);
      } else {
        await api.post('/api/pathologies', body);
      }

      closeModal();
      fetchPathologies();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Erro ao salvar patologia.';
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a patologia "${name}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/pathologies/${id}`);
      setPathologies((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Erro ao excluir patologia. Verifique se não há registros vinculados.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patologias</h1>
          <p className="text-sm text-gray-500">
            {pathologies.length} patologia{pathologies.length !== 1 ? 's' : ''} cadastrada{pathologies.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>
          Nova Patologia
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou descrição..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 size={24} className="animate-spin text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm">
              {search ? 'Nenhuma patologia encontrada para a pesquisa.' : 'Nenhuma patologia cadastrada.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <li
                key={p.id}
                className="group flex items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex-shrink-0">
                  <Bug size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  {p.description && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{p.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition"
                    title="Editar patologia"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={deletingId === p.id}
                    className="p-2 rounded-lg text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition disabled:opacity-50"
                    title="Excluir patologia"
                  >
                    {deletingId === p.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? 'Editar Patologia' : 'Nova Patologia'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <div className="bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
                  placeholder="Ex.: Onicomicose"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none"
                  placeholder="Descrição opcional..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  {editingId ? 'Salvar alterações' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatologiasPage;
