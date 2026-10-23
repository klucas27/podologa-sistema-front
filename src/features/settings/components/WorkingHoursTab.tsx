import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/ui/Button';
import { ApiError } from '@/lib/api';
import { useProfessionals } from '@/features/professionals/hooks/useProfessionals';
import { settingsService } from '../services/settings.service';
import type { WorkingHours } from '@/types';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface DayRow {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const EMPTY_WEEK: DayRow[] = WEEKDAYS.map((_, wd) => ({ enabled: wd >= 1 && wd <= 6, startTime: '09:00', endTime: '18:00' }));

/** Uma janela por dia; almoço e folgas pontuais vão em "Bloqueios de agenda". */
function toRows(hours: WorkingHours[]): DayRow[] {
  return WEEKDAYS.map((_, wd) => {
    const day = hours.filter((h) => h.weekday === wd);
    if (day.length === 0) return { enabled: false, startTime: '09:00', endTime: '18:00' };
    return {
      enabled: true,
      startTime: day.reduce((m, h) => (h.startTime < m ? h.startTime : m), day[0]?.startTime ?? '09:00'),
      endTime: day.reduce((m, h) => (h.endTime > m ? h.endTime : m), day[0]?.endTime ?? '18:00'),
    };
  });
}

const TIME_INPUT = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none disabled:bg-gray-50 disabled:text-gray-400';

interface WeekFormProps {
  professionalId: string;
  initial: WorkingHours[];
}

/** Recriado (key) a cada troca de profissional: o estado inicial vem do servidor. */
const WeekForm: React.FC<WeekFormProps> = ({ professionalId, initial }) => {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<DayRow[]>(() => (initial.length ? toRows(initial) : EMPTY_WEEK));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const save = useMutation({
    mutationFn: (days: WorkingHours[]) => settingsService.setWorkingHours(professionalId, days),
    onSuccess: (saved) => {
      queryClient.setQueryData(['working-hours', professionalId], saved);
      setSuccess('Expediente salvo.');
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Erro ao salvar o expediente.'),
  });

  const update = (wd: number, patch: Partial<DayRow>) =>
    setRows((r) => r.map((row, i) => (i === wd ? { ...row, ...patch } : row)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const invalid = rows.findIndex((r) => r.enabled && r.startTime >= r.endTime);
    if (invalid >= 0) {
      setError(`${WEEKDAYS[invalid]}: o início deve ser antes do fim.`);
      return;
    }
    save.mutate(rows.flatMap((r, weekday) => (r.enabled ? [{ weekday, startTime: r.startTime, endTime: r.endTime }] : [])));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="flex items-center gap-2 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />{error}
        </div>
      )}
      {success && (
        <div role="status" className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle size={16} className="flex-shrink-0" />{success}
        </div>
      )}

      <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl">
        {rows.map((row, wd) => (
          <li key={WEEKDAYS[wd]} className="grid grid-cols-[minmax(7rem,auto)_1fr_1fr] items-center gap-3 px-3 py-2">
            <label htmlFor={`wh-day-${wd}`} className="flex items-center gap-2 min-h-11 cursor-pointer">
              <input id={`wh-day-${wd}`} type="checkbox" checked={row.enabled} onChange={(e) => update(wd, { enabled: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
              <span className="text-sm font-medium text-gray-700">{WEEKDAYS[wd]}</span>
            </label>
            <input type="time" aria-label={`${WEEKDAYS[wd]} início`} value={row.startTime} disabled={!row.enabled}
              onChange={(e) => update(wd, { startTime: e.target.value })} className={TIME_INPUT} />
            <input type="time" aria-label={`${WEEKDAYS[wd]} fim`} value={row.endTime} disabled={!row.enabled}
              onChange={(e) => update(wd, { endTime: e.target.value })} className={TIME_INPUT} />
          </li>
        ))}
      </ul>

      <Button type="submit" isLoading={save.isPending}>Salvar expediente</Button>
    </form>
  );
};

const WorkingHoursTab: React.FC = () => {
  const { data: professionals = [] } = useProfessionals();
  const active = professionals.filter((p) => p.isActive);
  const [chosenId, setChosenId] = useState('');
  const professionalId = chosenId || active[0]?.id || '';

  const hoursQuery = useQuery({
    queryKey: ['working-hours', professionalId],
    queryFn: () => settingsService.getWorkingHours(professionalId),
    enabled: !!professionalId,
  });

  if (active.length === 0) {
    return <p className="text-sm text-gray-500">Cadastre uma profissional para definir o expediente.</p>;
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <label htmlFor="wh-professional" className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
        <select id="wh-professional" value={professionalId} onChange={(e) => setChosenId(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base bg-white">
          {active.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
        </select>
        <p className="text-xs text-gray-500 mt-1">Só aparecem na agenda e no link os horários dentro do expediente. Almoço e folgas: use bloqueios de agenda.</p>
      </div>

      {hoursQuery.isLoading || !hoursQuery.data ? (
        <p className="text-sm text-gray-500">Carregando…</p>
      ) : (
        <WeekForm key={professionalId} professionalId={professionalId} initial={hoursQuery.data} />
      )}
    </div>
  );
};

export default WorkingHoursTab;
