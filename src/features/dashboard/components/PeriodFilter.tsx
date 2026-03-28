import React from 'react';
import type { PeriodType } from '@/types';

const PERIODS: { value: PeriodType; label: string }[] = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'annual', label: 'Anual' },
];

interface PeriodFilterProps {
  selected: PeriodType;
  onChange: (period: PeriodType) => void;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({ selected, onChange }) => {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {PERIODS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
            selected === value
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default PeriodFilter;
