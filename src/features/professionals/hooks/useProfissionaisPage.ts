import { useState } from 'react';
import { useProfessionals, useCreateProfessional, useUpdateProfessional, useDeleteProfessional } from './useProfessionals';
import type { Professional } from '@/types';

interface ProfessionalForm {
  fullName: string;
  specialty: string;
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
}

const EMPTY_FORM: ProfessionalForm = { fullName: '', specialty: '', phoneNumber: '', email: '', username: '', password: '' };

export type { ProfessionalForm };

export function useProfissionaisPage() {
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfessionalForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const { data: professionals = [], isLoading } = useProfessionals();
  const createMutation = useCreateProfessional();
  const updateMutation = useUpdateProfessional();
  const deleteMutation = useDeleteProfessional();

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const deletingId = deleteMutation.isPending ? (deleteMutation.variables as string | undefined) ?? null : null;

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
      username: '',
      password: '',
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.fullName.trim()) {
      setFormError('O nome completo é obrigatório.');
      return;
    }

    if (!editingId) {
      if (!form.username.trim() || form.username.trim().length < 3) {
        setFormError('Usuário deve ter pelo menos 3 caracteres.');
        return;
      }
      if (!form.password || form.password.length < 6) {
        setFormError('Senha deve ter pelo menos 6 caracteres.');
        return;
      }
    }

    const onSuccess = () => closeModal();
    const onError = (err: unknown) => {
      const message = (err as { message?: string })?.message || 'Erro ao salvar profissional.';
      setFormError(message);
    };

    const body: Record<string, unknown> = {
      fullName: form.fullName.trim(),
      specialty: form.specialty.trim() || null,
      phoneNumber: form.phoneNumber.trim() || null,
      email: form.email.trim() || null,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: body }, { onSuccess, onError });
    } else {
      body.username = form.username.trim();
      body.password = form.password;
      createMutation.mutate(body, { onSuccess, onError });
    }
  };

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o profissional "${name}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    deleteMutation.mutate(id);
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
