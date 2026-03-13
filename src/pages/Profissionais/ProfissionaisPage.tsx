import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  X,
  UserCog,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import type { Professional } from '@/types';

interface ProfessionalForm {
  fullName: string;
  specialty: string;
  phoneNumber: string;
  email: string;
}

const EMPTY_FORM: ProfessionalForm = { fullName: '', specialty: '', phoneNumber: '', email: '' };

const ProfissionaisPage: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfessionalForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ data: Professional[] }>('/api/professionals');
      setProfessionals(res.data);
    } catch {
      setProfessionals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const filtered = professionals.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      (p.specialty ?? '').toLowerCase().includes(q) ||
      (p.email ?? '').toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (p: Professional) => {
    setEditingId(p.id);
    setForm({
      fullName: p.fullName,
      specialty: p.specialty ?? '',
      phoneNumber: p.phoneNumber ?? '',
      email: p.email ?? '',
    });
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

    if (!form.fullName.trim()) {
      setFormError('O nome completo é obrigatório.');
      return;
    }

    setIsSaving(true);
    try {
      const body = {
        fullName: form.fullName.trim(),
        specialty: form.specialty.trim() || null,
        phoneNumber: form.phoneNumber.trim() || null,
        email: form.email.trim() || null,
      };

      if (editingId) {
        await api.patch(`/api/professionals/${editingId}`, body);
      } else {
        await api.post('/api/professionals', body);
      }

      closeModal();
      fetchProfessionals();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Erro ao salvar profissional.';
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o profissional "${name}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/professionals/${id}`);
      setProfessionals((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Erro ao excluir profissional. Verifique se não há consultas vinculadas.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatPhone = (phone: string | null): string => {
    if (!phone) return '';
    const d = phone.replace(/\D/g, '');
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return phone;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profissionais</h1>
          <p className="text-sm text-gray-500">
            {professionals.length} profissional{professionals.length !== 1 ? 'is' : ''} cadastrado{professionals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>
          Novo Profissional
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome, especialidade ou e-mail..."
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
              {search ? 'Nenhum profissional encontrado para a pesquisa.' : 'Nenhum profissional cadastrado.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <li
                key={p.id}
                className="group flex items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex-shrink-0">
                  <UserCog size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {p.fullName}
                    {!p.isActive && (
                      <span className="ml-2 text-xs font-normal text-gray-400">(inativo)</span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {p.specialty && (
                      <span className="text-xs text-gray-500 truncate">{p.specialty}</span>
                    )}
                    {p.phoneNumber && (
                      <span className="text-xs text-gray-400 truncate">{formatPhone(p.phoneNumber)}</span>
                    )}
                    {p.email && (
                      <span className="text-xs text-gray-400 truncate">{p.email}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition"
                    title="Editar profissional"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.fullName)}
                    disabled={deletingId === p.id}
                    className="p-2 rounded-lg text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition disabled:opacity-50"
                    title="Excluir profissional"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeModal}>
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? 'Editar Profissional' : 'Novo Profissional'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded text-gray-400 hover:text-gray-600 transition"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <div className="bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label htmlFor="prof-fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo <span className="text-danger-500">*</span>
                </label>
                <input
                  id="prof-fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
                  placeholder="Nome completo do profissional"
                />
              </div>

              <div>
                <label htmlFor="prof-specialty" className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidade
                </label>
                <input
                  id="prof-specialty"
                  type="text"
                  value={form.specialty}
                  onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
                  placeholder="Ex: Podologia, Fisioterapia..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prof-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    id="prof-phone"
                    type="text"
                    value={form.phoneNumber}
                    onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label htmlFor="prof-email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    id="prof-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
                    placeholder="profissional@email.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfissionaisPage;
