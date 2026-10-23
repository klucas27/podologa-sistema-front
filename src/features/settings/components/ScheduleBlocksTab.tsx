import React, { useState } from 'react';
import { AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/ui/Button';
import { ApiError } from '@/lib/api';
import { useActiveProfessionals } from '@/features/professionals/hooks/useProfessionals';
import { formatDate, formatTime, toISODate } from '@/lib/dateUtils';
import { settingsService } from '../services/settings.service';

const INPUT = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none bg-white';
const DAYS_AHEAD = 60;

interface Conflict { date: string; start: string; end: string }

const range = () => {
  const from = new Date();
  const to = new Date(from.getTime() + DAYS_AHEAD * 86_400_000);
  return { from: toISODate(from), to: toISODate(to) };
};

const ScheduleBlocksTab: React.FC = () => {
  const qc = useQueryClient();
  const { from, to } = range();
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['schedule-blocks', from, to],
    queryFn: () => settingsService.listBlocks(from, to),
  });
  const { data: professionals = [] } = useActiveProfessionals();
  const nameOf = (id: string | null) => (id ? professionals.find((p) => p.id === id)?.fullName ?? 'Profissional' : 'Salão todo');

  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState(from);
  const [wholeDay, setWholeDay] = useState(false);
  const [start, setStart] = useState('12:00');
  const [end, setEnd] = useState('13:00');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['schedule-blocks'] });
  const create = useMutation({
    mutationFn: settingsService.createBlock,
    onSuccess: () => { invalidate(); setReason(''); },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar o bloqueio.');
      const found = err instanceof ApiError ? (err.details?.['conflicts'] as Conflict[] | undefined) : undefined;
      setConflicts(found ?? []);
    },
  });
  const remove = useMutation({ mutationFn: settingsService.deleteBlock, onSuccess: invalidate });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConflicts([]);
    const startAt = `${date}T${wholeDay ? '00:00' : start}`;
    const endAt = `${date}T${wholeDay ? '23:59' : end}`;
    if (endAt <= startAt) return setError('O fim deve ser depois do início.');
    create.mutate({ professionalId: professionalId || null, startAt, endAt, reason: reason.trim() || null });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-gray-200 p-4">
        <p className="text-sm text-gray-500">Folgas, feriados, almoço e compromissos. Os horários bloqueados somem da agenda e do link.</p>
        {error && (
          <div role="alert" className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
            <p className="flex items-center gap-2"><AlertCircle size={16} />{error}</p>
            {conflicts.length > 0 && (
              <ul className="mt-2 list-disc pl-6">
                {conflicts.map((c) => <li key={`${c.date}${c.start}`}>{formatDate(c.date)} das {c.start} às {c.end}</li>)}
              </ul>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="blk-who" className="block text-sm font-medium text-gray-700 mb-1">Para quem</label>
            <select id="blk-who" value={professionalId} onChange={(e) => setProfessionalId(e.target.value)} className={INPUT}>
              <option value="">Salão todo</option>
              {professionals.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="blk-date" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input id="blk-date" type="date" value={date} min={from} onChange={(e) => setDate(e.target.value)} className={INPUT} />
          </div>
        </div>

        <label htmlFor="blk-whole" className="flex items-center gap-3 min-h-11 cursor-pointer">
          <input id="blk-whole" type="checkbox" checked={wholeDay} onChange={(e) => setWholeDay(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
          <span className="text-sm font-medium text-gray-700">Dia inteiro</span>
        </label>

        {!wholeDay && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="blk-start" className="block text-sm font-medium text-gray-700 mb-1">Início</label>
              <input id="blk-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label htmlFor="blk-end" className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
              <input id="blk-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={INPUT} />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="blk-reason" className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
          <input id="blk-reason" maxLength={120} value={reason} onChange={(e) => setReason(e.target.value)} className={INPUT} placeholder="Ex.: almoço, feriado, curso" />
        </div>

        <Button type="submit" isLoading={create.isPending}>Bloquear horário</Button>
      </form>

      <section aria-labelledby="blk-list-title">
        <h3 id="blk-list-title" className="text-sm font-semibold text-gray-700 mb-2">Próximos {DAYS_AHEAD} dias</h3>
        {isLoading ? (
          <Loader2 size={20} className="animate-spin text-primary-500" />
        ) : blocks.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum bloqueio.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
            {blocks.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-4 py-2">
                <div className="flex-1 min-w-0 text-sm">
                  <p className="font-medium text-gray-800">{formatDate(b.startAt)} · {formatTime(b.startAt)}–{formatTime(b.endAt)}</p>
                  <p className="text-gray-500 truncate">{nameOf(b.professionalId)}{b.reason ? ` · ${b.reason}` : ''}</p>
                </div>
                <button type="button" onClick={() => remove.mutate(b.id)} disabled={remove.isPending}
                  className="p-3 rounded-lg text-gray-500 hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
                  aria-label={`Remover bloqueio de ${formatDate(b.startAt)}`}>
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ScheduleBlocksTab;
