import { useState } from 'react';
import { usePathologies, useCreatePathology, useUpdatePathology, useDeletePathology } from './usePathologies';
import type { Pathology } from '@/types';

export interface PathologyForm {
  name: string;
  description: string;
}

const EMPTY_FORM: PathologyForm = { name: '', description: '' };

export function usePatologiasPage() {
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PathologyForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const { data: pathologies = [], isLoading } = usePathologies();
  const createMutation = useCreatePathology();
  const updateMutation = useUpdatePathology();
  const deleteMutation = useDeletePathology();

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const deletingId = deleteMutation.isPending ? (deleteMutation.variables as string | undefined) ?? null : null;

  const filtered = pathologies.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q);
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('O nome é obrigatório.');
      return;
    }

    const body = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    };

    const onSuccess = () => closeModal();
    const onError = (err: unknown) => {
      const message = (err as { message?: string })?.message || 'Erro ao salvar patologia.';
      setFormError(message);
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: body }, { onSuccess, onError });
    } else {
      createMutation.mutate(body, { onSuccess, onError });
    }
  };

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a patologia "${name}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    deleteMutation.mutate(id);
  };

  return {
    pathologies, filtered, search, setSearch, isLoading, deletingId,
    modalOpen, editingId, form, setForm, isSaving, formError,
    openCreate, openEdit, closeModal, handleSave, handleDelete,
  };
}
