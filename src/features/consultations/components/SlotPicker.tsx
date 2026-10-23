import React from 'react';

interface SlotPickerProps {
  slots: string[];
  selected: string;
  isLoading?: boolean;
  onSelect: (start: string) => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({ slots, selected, isLoading, onSelect }) => (
  <div>
    <p className="block text-sm font-medium text-gray-700 mb-1">Horários livres</p>
    {isLoading ? (
      <p className="text-sm text-gray-500">Buscando horários…</p>
    ) : slots.length === 0 ? (
      <p className="text-sm text-gray-600">Nenhum horário livre neste dia.</p>
    ) : (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((start) => {
          const isSelected = start === selected;
          return (
            <button
              key={start}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(start)}
              className={`min-h-11 min-w-11 rounded-lg border text-base ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 text-primary-800 font-medium'
                  : 'border-gray-200 bg-white text-gray-800'
              }`}
            >
              {start}
            </button>
          );
        })}
      </div>
    )}
  </div>
);
