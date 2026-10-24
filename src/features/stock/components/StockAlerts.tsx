import React from 'react';
import { AlertTriangle, CalendarClock, PackageX } from 'lucide-react';
import { formatDay, formatQty, expiryTone, TONE_CLASS } from './stockFormat';
import type { StockAlertsData } from '../services/stock.service';

interface Props {
  alerts: StockAlertsData;
  canDiscard: boolean;
  onDiscard: (batchId: string, name: string) => void;
}

const Card: React.FC<{ title: string; icon: React.ReactNode; count: number; children: React.ReactNode }> = ({ title, icon, count, children }) => (
  <section className="bg-white rounded-xl border border-gray-200 p-4" aria-label={title}>
    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">{icon}{title}<span className="ml-auto text-lg font-bold text-gray-800">{count}</span></h2>
    {count === 0 ? <p className="text-xs text-gray-400">Nada por aqui.</p> : <ul className="space-y-1 text-sm">{children}</ul>}
  </section>
);

export const StockAlerts: React.FC<Props> = ({ alerts, canDiscard, onDiscard }) => (
  <div className="grid gap-3 md:grid-cols-3">
    <Card title="Vencendo em 30 dias" icon={<CalendarClock size={16} className="text-amber-600" />} count={alerts.expiring.length}>
      {alerts.expiring.map((b) => {
        const tone = expiryTone(b.expiryDate);
        return (
          <li key={b.batchId} className="flex items-center gap-2">
            <span className="flex-1 min-w-0 truncate">{b.name} · {formatQty(b.quantity, b.unit)}</span>
            <span className={TONE_CLASS[tone]}>{formatDay(b.expiryDate)}</span>
            {canDiscard && tone === 'expired' && (
              <button type="button" onClick={() => onDiscard(b.batchId, b.name)} className="min-h-11 px-3 rounded-lg text-danger-600 hover:bg-danger-50 text-xs font-medium">Descartar</button>
            )}
          </li>
        );
      })}
    </Card>
    <Card title="Abaixo do mínimo" icon={<AlertTriangle size={16} className="text-danger-600" />} count={alerts.belowMin.length}>
      {alerts.belowMin.map((p) => (
        <li key={p.productId} className="flex justify-between gap-2"><span className="truncate">{p.name}</span><span className="text-danger-600">{formatQty(p.balance, p.unit)} / mín. {formatQty(p.minQuantity, p.unit)}</span></li>
      ))}
    </Card>
    <Card title="Faltas nos atendimentos (30 dias)" icon={<PackageX size={16} className="text-gray-500" />} count={alerts.shortages.length}>
      {alerts.shortages.map((s) => (
        <li key={s.id} className="flex justify-between gap-2"><span className="truncate">{s.name}</span><span>{formatQty(s.quantity, s.unit)}</span></li>
      ))}
    </Card>
  </div>
);
