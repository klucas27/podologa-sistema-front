import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingService } from '../services/billing.service';
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
  const [billings, setBillings] = useState<Billing[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BillingStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBillings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await billingService.list();
      setBillings(data);
    } catch {
      setBillings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillings();
  }, [fetchBillings]);

  const updateStatus = async (id: string, newStatus: BillingStatus) => {
    setUpdatingId(id);
    try {
      await billingService.updateStatus(
        id,
        newStatus,
        newStatus === 'paid' ? new Date().toISOString() : null,
      );
      await fetchBillings();
    } catch {
      alert('Erro ao atualizar status da transação.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = billings.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const appt = b.appointment as Billing['appointment'] & {
      patient?: { fullName: string };
      professional?: { fullName: string };
    };
    return (
      (appt?.patient?.fullName ?? '').toLowerCase().includes(q) ||
      (appt?.professional?.fullName ?? '').toLowerCase().includes(q) ||
      PAYMENT_METHOD_LABELS[b.paymentMethod].toLowerCase().includes(q)
    );
  });

  const totalAmount = filtered.reduce(
    (sum, b) => sum + parseFloat(b.amount?.toString() ?? '0'), 0,
  );
  const paidAmount = filtered
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + parseFloat(b.amount?.toString() ?? '0'), 0);
  const pendingAmount = filtered
    .filter((b) => b.status === 'pending')
    .reduce((sum, b) => sum + parseFloat(b.amount?.toString() ?? '0'), 0);

  return {
    billings, filtered, search, setSearch, statusFilter, setStatusFilter,
    isLoading, updatingId, updateStatus,
    totalAmount, paidAmount, pendingAmount,
    navigateToExecution: (id: string) => navigate(`/consultas/${id}/execucao`),
    paymentMethodLabel: (m: PaymentMethod) => PAYMENT_METHOD_LABELS[m],
  };
}
