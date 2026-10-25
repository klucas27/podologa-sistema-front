import React from 'react';
import {
  Search, Eye, CheckCircle, XCircle, RotateCcw, Loader2,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SkeletonTable } from '@/components/ui/Skeleton';
import {
  useTransacoesPage, formatDate, formatCurrency, toNumber, STATUS_LABELS, PAYMENT_METHOD_LABELS,
} from '../hooks/useTransacoesPage';
import type { Billing, BillingStatus, PaymentMethod } from '@/types';

const INPUT = 'px-3 py-2.5 min-h-11 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white';
const ACTION = 'min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-gray-400 transition disabled:opacity-50';

type Page = ReturnType<typeof useTransacoesPage>;

const Actions: React.FC<{ h: Page; billing: Billing }> = ({ h, billing }) => (
  <div className="flex items-center justify-center gap-1">
    {billing.appointmentId && (
      <button type="button" onClick={() => h.navigateToExecution(billing.appointmentId)} className={`${ACTION} hover:bg-primary-50 hover:text-primary-600`} title="Ver atendimento" aria-label="Ver atendimento"><Eye size={16} /></button>
    )}
    {billing.status === 'pending' && (
      <>
        <button type="button" onClick={() => h.updateStatus(billing.id, 'paid')} disabled={h.updatingId === billing.id} className={`${ACTION} hover:bg-green-50 hover:text-green-600`} title="Marcar como pago" aria-label="Marcar como pago">
          {h.updatingId === billing.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
        </button>
        <button type="button" onClick={() => h.updateStatus(billing.id, 'cancelled')} disabled={h.updatingId === billing.id} className={`${ACTION} hover:bg-red-50 hover:text-red-600`} title="Cancelar" aria-label="Cancelar cobrança"><XCircle size={16} /></button>
      </>
    )}
    {billing.status === 'paid' && (
      <button type="button" onClick={() => h.updateStatus(billing.id, 'refunded')} disabled={h.updatingId === billing.id} className={`${ACTION} hover:bg-gray-100 hover:text-gray-600`} title="Reembolsar" aria-label="Reembolsar">
        {h.updatingId === billing.id ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
      </button>
    )}
  </div>
);

const DailyClosing: React.FC<{ h: Page }> = ({ h }) => {
  const s = h.summary;
  return (
    <section aria-labelledby="closing-title" className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 id="closing-title" className="text-lg font-semibold text-gray-800">Fechamento do dia</h2>
        <input type="date" aria-label="Data do fechamento" value={h.summaryDate} onChange={(e) => e.target.value && h.setSummaryDate(e.target.value)} className={INPUT} />
      </div>
      {h.summaryLoading && !s ? (
        <Loader2 size={20} className="animate-spin text-primary-500" />
      ) : s ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-xs text-green-700 uppercase font-medium">Recebido</p>
              <p className="text-xl font-bold text-green-800 mt-1">{formatCurrency(s.total)}</p>
              <p className="text-xs text-green-700">{s.count} pagamento{s.count === 1 ? '' : 's'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500 uppercase font-medium">Descontos</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(s.discounts)}</p>
            </div>
            {s.byMethod.map((m) => (
              <div key={m.paymentMethod} className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500 uppercase font-medium">{PAYMENT_METHOD_LABELS[m.paymentMethod] ?? m.paymentMethod}</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">{formatCurrency(m.total)}</p>
                <p className="text-xs text-gray-500">{m.count} pagamento{m.count === 1 ? '' : 's'}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Pendentes dos atendimentos do dia</h3>
            {s.pending.length === 0 ? (
              <p className="text-sm text-gray-400 mt-1">Nenhuma cobrança pendente.</p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100">
                {s.pending.map((p) => (
                  <li key={p.billingId} className="flex justify-between gap-3 py-2 text-sm">
                    <span className="text-gray-700">{p.patientName}{p.serviceName ? ` · ${p.serviceName}` : ''}</span>
                    <span className="font-medium text-yellow-700">{formatCurrency(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
};

const TransacoesPage: React.FC = () => {
  const h = useTransacoesPage();
  const set = <K extends keyof typeof h.filters>(key: K, value: (typeof h.filters)[K]) => h.setFilters({ ...h.filters, [key]: value });

  return (
    <ErrorBoundary featureName="Transações">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Transações</h1>
        <p className="text-sm text-gray-500">{h.filtered.length} transaç{h.filtered.length !== 1 ? 'ões' : 'ão'} no período</p>
      </div>

      <DailyClosing h={h} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 uppercase font-medium">Total líquido</p>
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

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <label className="text-xs text-gray-500">De<input type="date" aria-label="De" value={h.filters.from} max={h.filters.to} onChange={(e) => set('from', e.target.value)} className={`${INPUT} block w-full`} /></label>
        <label className="text-xs text-gray-500">Até<input type="date" aria-label="Até" value={h.filters.to} min={h.filters.from} onChange={(e) => set('to', e.target.value)} className={`${INPUT} block w-full`} /></label>
        <select aria-label="Profissional" value={h.filters.professionalId} onChange={(e) => set('professionalId', e.target.value)} className={`${INPUT} self-end`}>
          <option value="">Todas as profissionais</option>
          {h.professionals.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
        </select>
        <select aria-label="Filtrar por status" value={h.filters.status} onChange={(e) => set('status', e.target.value as BillingStatus | '')} className={`${INPUT} self-end`}>
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="cancelled">Cancelado</option>
          <option value="refunded">Reembolsado</option>
        </select>
        <select aria-label="Forma de pagamento" value={h.filters.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value as PaymentMethod | '')} className={`${INPUT} self-end`}>
          <option value="">Todas as formas</option>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <div className="relative self-end">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={h.search} onChange={(e) => h.setSearch(e.target.value)} aria-label="Pesquisar" placeholder="Cliente, serviço..." className={`${INPUT} w-full pl-10`} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {h.isLoading ? (
          <div className="p-4"><SkeletonTable rows={6} cols={6} /></div>
        ) : h.filtered.length === 0 ? (
          <div className="p-8 text-center"><p className="text-gray-400 text-sm">Nenhuma transação encontrada para os filtros.</p></div>
        ) : (
          <>
            {/* Celular: cartões */}
            <ul className="sm:hidden divide-y divide-gray-100">
              {h.filtered.map((b) => {
                const statusInfo = STATUS_LABELS[b.status] ?? STATUS_LABELS['pending'];
                return (
                  <li key={b.id} className="p-4 space-y-1">
                    <div className="flex justify-between gap-2">
                      <p className="font-medium text-gray-800">{b.patientName ?? '—'}</p>
                      <p className="font-semibold text-gray-800">{formatCurrency(toNumber(b.amount))}</p>
                    </div>
                    <p className="text-sm text-gray-600">{b.serviceName ?? '—'} · {b.professionalName ?? '—'}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(b.paidAt ?? b.createdAt)} · {h.paymentMethodLabel(b.paymentMethod)}
                      {toNumber(b.discount) > 0 ? ` · desconto ${formatCurrency(toNumber(b.discount))}` : ''}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>{statusInfo.label}</span>
                      <Actions h={h} billing={b} />
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profissional</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Desconto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Forma</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {h.filtered.map((b) => {
                    const statusInfo = STATUS_LABELS[b.status] ?? STATUS_LABELS['pending'];
                    return (
                      <tr key={b.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-800">{b.patientName ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{b.serviceName ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{b.professionalName ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(b.paidAt ?? b.createdAt)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800 whitespace-nowrap">{formatCurrency(toNumber(b.amount))}</td>
                        <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">{toNumber(b.discount) > 0 ? formatCurrency(toNumber(b.discount)) : '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{h.paymentMethodLabel(b.paymentMethod)}</td>
                        <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>{statusInfo.label}</span></td>
                        <td className="px-4 py-3 text-center"><Actions h={h} billing={b} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default TransacoesPage;
