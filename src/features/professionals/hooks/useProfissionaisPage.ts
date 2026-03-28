import { useCallback, useEffect, useState } from 'react';
import { professionalService } from '../services/professional.service';
import type { Professional } from '@/types';

interface ProfessionalForm {
  fullName: string;
  specialty: string;
  phoneNumber: string;
  email: string;
}

const EMPTY_FORM: ProfessionalForm = { fullName: '', specialty: '', phoneNumber: '', email: '' };

export type { ProfessionalForm };

export function useProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfessionalForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await professionalService.list();
      setProfessionals(data);
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
        await professionalService.update(editingId, body as Record<string, unknown>);
      } else {
        await professionalService.create(body as Record<string, unknown>);
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
      await professionalService.delete(id);
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

  return {
    professionals, filtered, search, setSearch, isLoading, deletingId,
    modalOpen, editingId, form, setForm, isSaving, formError,
    openCreate, openEdit, closeModal, handleSave, handleDelete, formatPhone,
  };
}
