import { useState } from 'react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from './useServices';
import { useAuth } from '@/hooks/useAuth';
import type { Service, ServiceCategory } from '@/types';

export interface ServiceForm {
  name: string;
  category: ServiceCategory;
  durationMinutes: string;
  price: string;
  commissionRate: string;
  requiresAnamnesis: boolean;
  isPublic: boolean;
  isActive: boolean;
}

const EMPTY_FORM: ServiceForm = {
  name: '', category: 'estetica', durationMinutes: '45', price: '', commissionRate: '',
  requiresAnamnesis: false, isPublic: true, isActive: true,
};

const toNumber = (v: string): number => Number(v.replace(',', '.'));

export function useServicosPage() {
  const { role } = useAuth();
  const canEdit = role === 'admin';
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const { data: services = [], isLoading } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      category: s.category,
      durationMinutes: String(s.durationMinutes),
      price: String(s.price),
      commissionRate: s.commissionRate === null ? '' : String(s.commissionRate),
      requiresAnamnesis: s.requiresAnamnesis,
      isPublic: s.isPublic,
      isActive: s.isActive,
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = toNumber(form.durationMinutes);
    const price = toNumber(form.price);
    const commission = form.commissionRate.trim() === '' ? null : toNumber(form.commissionRate);

    if (!form.name.trim()) return setFormError('Informe o nome do serviço.');
    if (!Number.isInteger(duration) || duration < 5 || duration > 480) return setFormError('Duração deve ser de 5 a 480 minutos.');
    if (Number.isNaN(price) || price < 0) return setFormError('Preço inválido.');
    if (commission !== null && (Number.isNaN(commission) || commission < 0 || commission > 100)) {
      return setFormError('Comissão deve ser de 0 a 100%.');
    }

    const body = {
      name: form.name.trim(), category: form.category, durationMinutes: duration, price,
      commissionRate: commission, requiresAnamnesis: form.requiresAnamnesis, isPublic: form.isPublic,
    };
    const onError = (err: unknown) => setFormError((err as { message?: string })?.message || 'Erro ao salvar serviço.');

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { ...body, isActive: form.isActive } }, { onSuccess: closeModal, onError });
    } else {
      createMutation.mutate(body, { onSuccess: closeModal, onError });
    }
  };

  const handleDelete = (s: Service) => {
    if (!window.confirm(`Remover o serviço "${s.name}"? Agendamentos antigos continuam no histórico.`)) return;
    deleteMutation.mutate(s.id);
  };

  return { services, isLoading, canEdit, modalOpen, editingId, form, setForm, formError, isSaving, openCreate, openEdit, closeModal, handleSave, handleDelete };
}
