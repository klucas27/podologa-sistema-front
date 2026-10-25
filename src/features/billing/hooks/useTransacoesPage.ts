import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useBillings, useUpdateBillingStatus, billingKeys } from './useBillings';
import { billingService } from '../services/billing.service';
import { useDebounce } from '@/hooks/useDebounce';
import { nowSPISO } from '@/lib/dateUtils';
import { useActiveProfessionals } from '@/features/professionals/hooks/useProfessionals';
import type { BillingStatus, PaymentMethod } from '@/types';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  cash: 'Dinheiro',
  credit_card: 'Crédito',
  debit_card: 'Débito',
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

export const toNumber = (v: string | number | null | undefined) => Number(v ?? 0) || 0;

export interface TransactionFilters {
  from: string;
  to: string;
  professionalId: string;
  status: BillingStatus | '';
  paymentMethod: PaymentMethod | '';
}

/** Hoje em São Paulo (YYYY-MM-DD). */
export const todaySP = () => nowSPISO().slice(0, 10);

export function useTransacoesPage() {
  const navigate = useNavigate();
  const today = todaySP();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({
    from: `${today.slice(0, 8)}01`, to: today, professionalId: '', status: '', paymentMethod: '',
  });
  const [summaryDate, setSummaryDate] = useState(today);
  const debouncedSearch = useDebounce(search, 300);

  // Filtros vão para o servidor; a busca por texto refina a página carregada
  const params = useMemo(() => {
    const p: Record<string, string> = { limit: '200' };
    for (const [key, value] of Object.entries(filters)) if (value) p[key] = value;
    return p;
  }, [filters]);

  const { data: billings = [], isLoading } = useBillings(params);
  const summary = useQuery({
    queryKey: [...billingKeys.all, 'daily-summary', summaryDate],
    queryFn: () => billingService.dailySummary(summaryDate),
    enabled: /^\d{4}-\d{2}-\d{2}$/.test(summaryDate),
    placeholderData: keepPreviousData,
  });
  const { data: professionals = [] } = useActiveProfessionals();
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
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return [b.patientName, b.serviceName, b.professionalName, PAYMENT_METHOD_LABELS[b.paymentMethod]]
      .some((v) => (v ?? '').toLowerCase().includes(q));
  }), [billings, debouncedSearch]);

  const { totalAmount, paidAmount, pendingAmount } = useMemo(() => {
    const net = (b: (typeof filtered)[number]) => toNumber(b.amount) - toNumber(b.discount);
    return {
      totalAmount: filtered.reduce((sum, b) => sum + net(b), 0),
      paidAmount: filtered.filter((b) => b.status === 'paid').reduce((sum, b) => sum + net(b), 0),
      pendingAmount: filtered.filter((b) => b.status === 'pending').reduce((sum, b) => sum + net(b), 0),
    };
  }, [filtered]);

  return {
    billings, filtered, search, setSearch, filters, setFilters,
    summaryDate, setSummaryDate, summary: summary.data, summaryLoading: summary.isLoading,
    professionals, isLoading, updatingId, updateStatus,
    totalAmount, paidAmount, pendingAmount,
    navigateToExecution: (id: string) => navigate(`/consultas/${id}/execucao`),
    paymentMethodLabel: (m: PaymentMethod) => PAYMENT_METHOD_LABELS[m],
  };
}
