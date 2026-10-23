import React from 'react';

interface TimeSlotGridProps {
  slots: string[];
  disabled?: boolean;
  onSelect: (time: string) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ slots, disabled, onSelect }) => (
  <div>
    <h2 className="font-display text-2xl text-primary-700">Horário</h2>
    {slots.length === 0 ? (
      <p className="mt-3 text-sm text-gray-600">Nenhum horário livre neste dia.</p>
    ) : (
      <div className="mt-4 grid grid-cols-3 gap-2">
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(slot)}
            className="min-h-11 min-w-11 rounded-lg border border-primary-200 bg-white text-base text-gray-800 disabled:opacity-60"
          >
            {slot}
          </button>
        ))}
      </div>
    )}
  </div>
);
