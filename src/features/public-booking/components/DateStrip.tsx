import React from 'react';
import { formatDayChip } from '../lib/dates';

interface DateStripProps {
  days: string[];
  loading: boolean;
  canMore: boolean;
  onSelect: (date: string) => void;
  onMore: () => void;
}

export const DateStrip: React.FC<DateStripProps> = ({ days, loading, canMore, onSelect, onMore }) => (
  <div>
    <h2 className="font-display text-2xl text-primary-700">Dia</h2>
    {loading ? <p className="mt-3 text-sm text-gray-600">Buscando horários…</p> : null}
    {!loading && days.length === 0 ? (
      <p className="mt-3 text-sm text-gray-600">Nenhum horário livre nestes dias.</p>
    ) : (
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => onSelect(day)}
            className="min-h-11 shrink-0 rounded-lg border border-primary-200 bg-white px-3 text-base text-gray-800"
          >
            {formatDayChip(day)}
          </button>
        ))}
      </div>
    )}
    {canMore ? (
      <button type="button" onClick={onMore} className="mt-3 min-h-11 text-base font-medium text-primary-700">
        Mais datas
      </button>
    ) : null}
  </div>
);
