import { useState } from 'react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from './useServices';
import { serviceService } from '../services/service.service';
import { useAuth } from '@/hooks/useAuth';
import type { CommissionMode, Service, ServiceCategory } from '@/types';

export interface ProductLine {
  productId: string;
  quantity: string;
}

export interface ServiceForm {
  name: string;
  category: ServiceCategory;
  durationMinutes: string;
  price: string;
  commissionRate: string;
  commissionMode: CommissionMode;
  commissionFixed: string;
  requiresAnamnesis: boolean;
  isPublic: boolean;
  isActive: boolean;
  products: ProductLine[];
}

const EMPTY_FORM: ServiceForm = {
  name: '', category: 'estetica', durationMinutes: '45', price: '', commissionRate: '',
  commissionMode: 'percent', commissionFixed: '', requiresAnamnesis: false, isPublic: true, isActive: true, products: [],
};

const toNumber = (v: string): number => Number(v.trim().replace(',', '.'));
const toText = (v: number | null) => (v === null ? '' : String(v).replace('.', ','));

export const usesFixed = (mode: CommissionMode) => mode !== 'percent';

/** Valida o formulário e devolve o corpo da API, ou a mensagem de erro. */
export function buildServiceBody(form: ServiceForm) {
  const duration = toNumber(form.durationMinutes);
  const price = toNumber(form.price);
  const commission = form.commissionRate.trim() === '' ? null : toNumber(form.commissionRate);
  const fixed = usesFixed(form.commissionMode) && form.commissionFixed.trim() !== '' ? toNumber(form.commissionFixed) : null;

  if (!form.name.trim()) return { error: 'Informe o nome do serviço.' };
  if (!Number.isInteger(duration) || duration < 5 || duration > 480) return { error: 'Duração deve ser de 5 a 480 minutos.' };
  if (Number.isNaN(price) || price < 0) return { error: 'Preço inválido.' };
  if (commission !== null && (Number.isNaN(commission) || commission < 0 || commission > 100)) {
    return { error: 'Comissão deve ser de 0 a 100%.' };
  }
  if (usesFixed(form.commissionMode) && (fixed === null || Number.isNaN(fixed) || fixed < 0)) {
    return { error: 'Informe o valor fixo da comissão.' };
  }
  const items = form.products.filter((l) => l.productId).map((l) => ({ productId: l.productId, quantity: toNumber(l.quantity) }));
  if (items.some((i) => !(i.quantity > 0))) return { error: 'Quantidade do produto deve ser maior que zero.' };
  if (new Set(items.map((i) => i.productId)).size !== items.length) return { error: 'Produto repetido na lista.' };

  return {
    body: {
      name: form.name.trim(), category: form.category, durationMinutes: duration, price,
      commissionRate: commission, commissionMode: form.commissionMode, commissionFixed: fixed,
      requiresAnamnesis: form.requiresAnamnesis, isPublic: form.isPublic,
    },
    items,
  };
}

export function useServicosPage() {
  const { role } = useAuth();
  const canEdit = role === 'admin';
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [savingProducts, setSavingProducts] = useState(false);

  const { data: services = [], isLoading } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();
  const isSaving = createMutation.isPending || updateMutation.isPending || savingProducts;

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
      commissionRate: toText(s.commissionRate),
      commissionMode: s.commissionMode ?? 'percent',
      commissionFixed: toText(s.commissionFixed ?? null),
      requiresAnamnesis: s.requiresAnamnesis,
      isPublic: s.isPublic,
      isActive: s.isActive,
      products: [],
    });
    setFormError('');
    setModalOpen(true);
    // Ficha técnica chega depois; só preenche se o usuário ainda não mexeu na lista
    serviceService.listProducts(s.id).then(
      (items) => setForm((f) => (f.products.length ? f : { ...f, products: items.map((i) => ({ productId: i.productId, quantity: toText(i.quantity) })) })),
      () => setFormError('Não foi possível carregar os produtos usados.'),
    );
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = buildServiceBody(form);
    if ('error' in result) return setFormError(result.error ?? '');
    try {
      const saved = editingId
        ? await updateMutation.mutateAsync({ id: editingId, data: { ...result.body, isActive: form.isActive } })
        : await createMutation.mutateAsync(result.body);
      setSavingProducts(true);
      await serviceService.setProducts(saved.id, result.items);
      closeModal();
    } catch (err) {
      setFormError((err as { message?: string })?.message || 'Erro ao salvar serviço.');
    } finally {
      setSavingProducts(false);
    }
  };

  const handleDelete = (s: Service) => {
    if (!window.confirm(`Remover o serviço "${s.name}"? Agendamentos antigos continuam no histórico.`)) return;
    deleteMutation.mutate(s.id);
  };

  return { services, isLoading, canEdit, modalOpen, editingId, form, setForm, formError, isSaving, openCreate, openEdit, closeModal, handleSave, handleDelete };
}
