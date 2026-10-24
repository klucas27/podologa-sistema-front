import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarPlus, Loader2, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/lib/dateUtils';
import { useReferrals, useDeclineReferral } from '../hooks/useReferrals';
import type { Referral, ReferralStatus } from '../services/referral.service';

const TABS: [ReferralStatus, string][] = [
  ['pending', 'Pendentes'], ['scheduled', 'Agendados'], ['completed', 'Concluídos'], ['declined', 'Recusados'],
];

const EncaminhamentosPage: React.FC = () => {
  const { role } = useAuth();
  const canManage = role === 'admin' || role === 'recepcao';
  const navigate = useNavigate();
  const [tab, setTab] = useState<ReferralStatus>('pending');
  const { data: referrals = [], isLoading } = useReferrals(tab);
  const decline = useDeclineReferral();

  const handleDecline = (r: Referral) => {
    if (window.confirm(`Marcar que ${r.patientName} recusou o encaminhamento?`)) decline.mutate(r.id);
  };
  const schedule = (r: Referral) =>
    navigate(`/consultas/nova?patientId=${encodeURIComponent(r.patientId)}&referralId=${encodeURIComponent(r.id)}`);

  return (
    <ErrorBoundary featureName="Encaminhamentos">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Encaminhamentos</h1>
          <p className="text-sm text-gray-500">Clientes que a manicure indicou para avaliação com a podóloga.</p>
        </div>

        <div role="tablist" aria-label="Situação" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TABS.map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)}
              className={`min-h-11 rounded-lg border text-sm font-medium transition ${tab === value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600 bg-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 size={24} className="animate-spin text-primary-500" /></div>
        ) : referrals.length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200">Nenhum encaminhamento aqui.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {referrals.map((r) => (
              <li key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-800">{r.patientName}</p>
                  <span className="text-xs text-gray-400">{formatDateTime(r.createdAt)}</span>
                </div>
                <p className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                  {r.fromProfessionalName} <ArrowRight size={12} aria-label="para" /> {r.toProfessionalName ?? 'qualquer podóloga'}
                </p>
                <p className="text-sm text-gray-700">{r.reason}</p>
                {canManage && (r.status === 'pending' || r.status === 'scheduled') && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {r.status === 'pending' && (
                      <Button size="sm" className="min-h-11" icon={<CalendarPlus size={16} />} onClick={() => schedule(r)}>Agendar com a podóloga</Button>
                    )}
                    <Button size="sm" variant="secondary" className="min-h-11" icon={<XCircle size={16} />} onClick={() => handleDecline(r)}>Cliente recusou</Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default EncaminhamentosPage;
