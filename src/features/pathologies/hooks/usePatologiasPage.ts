import { useCallback, useEffect, useState } from 'react';
import { pathologyService } from '../services/pathology.service';
import type { Pathology } from '@/types';

export interface PathologyForm {
  name: string;
  description: string;
}

const EMPTY_FORM: PathologyForm = { name: '', description: '' };

export function usePatologiasPage() {
  const [pathologies, setPathologies] = useState<Pathology[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PathologyForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPathologies = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await pathologyService.list();
      setPathologies(data);
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
        description: form.description.trim() || undefined,
      };

      if (editingId) {
        await pathologyService.update(editingId, body);
      } else {
        await pathologyService.create(body);
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
      await pathologyService.delete(id);
      setPathologies((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Erro ao excluir patologia. Verifique se não há registros vinculados.');
    } finally {
      setDeletingId(null);
    }
  };

  return {
    pathologies, filtered, search, setSearch, isLoading, deletingId,
    modalOpen, editingId, form, setForm, isSaving, formError,
    openCreate, openEdit, closeModal, handleSave, handleDelete,
  };
}
