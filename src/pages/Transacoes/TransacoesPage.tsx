import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Search,
  Loader2,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { api } from '@/services/api';
import type { Billing, BillingStatus, PaymentMethod } from '@/types';

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  cash: 'Dinheiro',
  transfer: 'Transferência',
  other: 'Outro',
};

const STATUS_LABELS: Record<BillingStatus, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-yellow-50 text-yellow-700' },
  paid: { label: 'Pago', className: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-50 text-red-700' },
  refunded: { label: 'Reembolsado', className: 'bg-gray-100 text-gray-600' },
};

const formatDate = (iso: string) => {
  const parts = iso.slice(0, 10).split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const TransacoesPage: React.FC = () => {
  const navigate = useNavigate();
  const [billings, setBillings] = useState<Billing[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BillingStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBillings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ data: Billing[] }>('/api/billings');
      setBillings(res.data);
    } catch {
      setBillings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillings();
  }, [fetchBillings]);

  const updateBillingStatus = async (id: string, newStatus: BillingStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/api/billings/${id}`, {
        status: newStatus,
        paidAt: newStatus === 'paid' ? new Date().toISOString() : null,
      });
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
    (sum, b) => sum + parseFloat(b.amount?.toString() ?? '0'),
    0,
  );

  const paidAmount = filtered
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + parseFloat(b.amount?.toString() ?? '0'), 0);

  const pendingAmount = filtered
    .filter((b) => b.status === 'pending')
    .reduce((sum, b) => sum + parseFloat(b.amount?.toString() ?? '0'), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transações</h1>
          <p className="text-sm text-gray-500">
            {billings.length} transaç{billings.length !== 1 ? 'ões' : 'ão'} registrada{billings.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 uppercase font-medium">Total</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <p className="text-xs text-green-600 uppercase font-medium">Recebido</p>
          <p className="text-xl font-bold text-green-700 mt-1">{formatCurrency(paidAmount)}</p>
        </div>
        <div className="bg-white rounded-xl border border-yellow-200 p-4">
          <p className="text-xs text-yellow-600 uppercase font-medium">Pendente</p>
          <p className="text-xl font-bold text-yellow-700 mt-1">{formatCurrency(pendingAmount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por paciente, profissional ou método..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
          />
        </div>
        <select
          aria-label="Filtrar por status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BillingStatus | '')}
          className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="cancelled">Cancelado</option>
          <option value="refunded">Reembolsado</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 size={24} className="animate-spin text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm">
              {search || statusFilter ? 'Nenhuma transação encontrada para os filtros.' : 'Nenhuma transação registrada.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profissional</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((billing) => {
                  const appt = billing.appointment as Billing['appointment'] & {
                    patient?: { fullName: string };
                    professional?: { fullName: string };
                  };
                  const statusInfo = STATUS_LABELS[billing.status] ?? STATUS_LABELS['pending'];

                  return (
                    <tr key={billing.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {appt?.patient?.fullName ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {appt?.professional?.fullName ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(billing.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">
                        {formatCurrency(billing.amount)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {PAYMENT_METHOD_LABELS[billing.paymentMethod]}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {billing.appointmentId && (
                            <button
                              type="button"
                              onClick={() => navigate(`/consultas/${billing.appointmentId}/execucao`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition"
                              title="Ver consulta"
                            >
                              <Eye size={15} />
                            </button>
                          )}
                          {billing.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateBillingStatus(billing.id, 'paid')}
                                disabled={updatingId === billing.id}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition disabled:opacity-50"
                                title="Marcar como Pago"
                              >
                                {updatingId === billing.id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => updateBillingStatus(billing.id, 'cancelled')}
                                disabled={updatingId === billing.id}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                                title="Cancelar"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                          {billing.status === 'paid' && (
                            <button
                              type="button"
                              onClick={() => updateBillingStatus(billing.id, 'refunded')}
                              disabled={updatingId === billing.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-50"
                              title="Reembolsar"
                            >
                              {updatingId === billing.id ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransacoesPage;
