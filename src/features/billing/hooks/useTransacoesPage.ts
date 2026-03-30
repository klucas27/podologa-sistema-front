import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBillings, useUpdateBillingStatus } from './useBillings';
import { useDebounce } from '@/hooks/useDebounce';
import { nowSPISO } from '@/lib/dateUtils';
import type { Billing, BillingStatus, PaymentMethod } from '@/types';

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  cash: 'Dinheiro',
  transfer: 'Transferência',
  other: 'Outro',
};

export { formatDate, formatCurrency } from "@/lib/dateUtils";

export const STATUS_LABELS: Record<BillingStatus, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-yellow-50 text-yellow-700' },
  paid: { label: 'Pago', className: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-50 text-red-700' },
  refunded: { label: 'Reembolsado', className: 'bg-gray-100 text-gray-600' },
};

export function useTransacoesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BillingStatus | ''>('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: billings = [], isLoading } = useBillings();
  const updateStatusMutation = useUpdateBillingStatus();

  const updatingId = updateStatusMutation.isPending ? (updateStatusMutation.variables?.id ?? null) : null;

  const updateStatus = (id: string, newStatus: BillingStatus) => {
    updateStatusMutation.mutate({
      id,
      status: newStatus,
      paidAt: newStatus === 'paid' ? nowSPISO() : null,
    });
  };

  const filtered = useMemo(() => billings.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    const appt = b.appointment as Billing['appointment'] & {
      patient?: { fullName: string };
      professional?: { fullName: string };
    };
    return (
      (appt?.patient?.fullName ?? '').toLowerCase().includes(q) ||
      (appt?.professional?.fullName ?? '').toLowerCase().includes(q) ||
      PAYMENT_METHOD_LABELS[b.paymentMethod].toLowerCase().includes(q)
    );
  }), [billings, debouncedSearch, statusFilter]);

  const { totalAmount, paidAmount, pendingAmount } = useMemo(() => {
    const total = filtered.reduce(
      (sum, b) => sum + parseFloat(b.amount?.toString() ?? '0'), 0,
    );
    const paid = filtered
      .filter((b) => b.status === 'paid')
      .reduce((sum, b) => sum + parseFloat(b.amount?.toString() ?? '0'), 0);
    const pending = filtered
      .filter((b) => b.status === 'pending')
      .reduce((sum, b) => sum + parseFloat(b.amount?.toString() ?? '0'), 0);
    return { totalAmount: total, paidAmount: paid, pendingAmount: pending };
  }, [filtered]);

  return {
    billings, filtered, search, setSearch, statusFilter, setStatusFilter,
    isLoading, updatingId, updateStatus,
    totalAmount, paidAmount, pendingAmount,
    navigateToExecution: (id: string) => navigate(`/consultas/${id}/execucao`),
    paymentMethodLabel: (m: PaymentMethod) => PAYMENT_METHOD_LABELS[m],
  };
}
