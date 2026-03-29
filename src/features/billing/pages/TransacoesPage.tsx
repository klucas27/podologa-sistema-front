import React from 'react';
import {
  Search, Clock, Eye, CheckCircle, XCircle, RotateCcw, Loader2,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useTransacoesPage, formatDate, formatCurrency, STATUS_LABELS } from '../hooks/useTransacoesPage';
import type { BillingStatus } from '@/types';

const TransacoesPage: React.FC = () => {
  const h = useTransacoesPage();

  return (
    <ErrorBoundary featureName="Transações">
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transações</h1>
          <p className="text-sm text-gray-500">{h.billings.length} transaç{h.billings.length !== 1 ? 'ões' : 'ão'} registrada{h.billings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 uppercase font-medium">Total</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(h.totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <p className="text-xs text-green-600 uppercase font-medium">Recebido</p>
          <p className="text-xl font-bold text-green-700 mt-1">{formatCurrency(h.paidAmount)}</p>
        </div>
        <div className="bg-white rounded-xl border border-yellow-200 p-4">
          <p className="text-xs text-yellow-600 uppercase font-medium">Pendente</p>
          <p className="text-xl font-bold text-yellow-700 mt-1">{formatCurrency(h.pendingAmount)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={h.search} onChange={(e) => h.setSearch(e.target.value)} placeholder="Pesquisar por paciente, profissional ou método..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white" />
        </div>
        <select aria-label="Filtrar por status" value={h.statusFilter} onChange={(e) => h.setStatusFilter(e.target.value as BillingStatus | '')} className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white">
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="cancelled">Cancelado</option>
          <option value="refunded">Reembolsado</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {h.isLoading ? (
          <div className="p-4"><SkeletonTable rows={6} cols={6} /></div>
        ) : h.filtered.length === 0 ? (
          <div className="p-8 text-center"><p className="text-gray-400 text-sm">{h.search || h.statusFilter ? 'Nenhuma transação encontrada para os filtros.' : 'Nenhuma transação registrada.'}</p></div>
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
                {h.filtered.map((billing) => {
                  const appt = billing.appointment as typeof billing.appointment & { patient?: { fullName: string }; professional?: { fullName: string } };
                  const statusInfo = STATUS_LABELS[billing.status] ?? STATUS_LABELS['pending'];
                  return (
                    <tr key={billing.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{appt?.patient?.fullName ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{appt?.professional?.fullName ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500"><span className="flex items-center gap-1"><Clock size={12} />{formatDate(billing.createdAt)}</span></td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(billing.amount)}</td>
                      <td className="px-4 py-3 text-gray-600">{h.paymentMethodLabel(billing.paymentMethod)}</td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>{statusInfo.label}</span></td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {billing.appointmentId && (
                            <button type="button" onClick={() => h.navigateToExecution(billing.appointmentId!)} className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition" title="Ver consulta"><Eye size={15} /></button>
                          )}
                          {billing.status === 'pending' && (
                            <>
                              <button type="button" onClick={() => h.updateStatus(billing.id, 'paid')} disabled={h.updatingId === billing.id} className="p-1.5 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition disabled:opacity-50" title="Marcar como Pago">
                                {h.updatingId === billing.id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                              </button>
                              <button type="button" onClick={() => h.updateStatus(billing.id, 'cancelled')} disabled={h.updatingId === billing.id} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50" title="Cancelar"><XCircle size={15} /></button>
                            </>
                          )}
                          {billing.status === 'paid' && (
                            <button type="button" onClick={() => h.updateStatus(billing.id, 'refunded')} disabled={h.updatingId === billing.id} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-50" title="Reembolsar">
                              {h.updatingId === billing.id ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
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
    </ErrorBoundary>
  );
};

export default TransacoesPage;
