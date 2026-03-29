import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  colorClass: string;
  active?: boolean;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = React.memo(({
  label,
  value,
  icon: Icon,
  trend,
  colorClass,
  active = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card card-body flex items-center gap-4 transition-all duration-200 text-left w-full ${
        active
          ? 'ring-2 ring-primary-400 shadow-md'
          : 'hover:shadow-md'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 ${colorClass}`}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-800 leading-none">{value}</p>
        <p className="text-sm text-gray-500 mt-1 truncate">{label}</p>
        {trend && (
          <p
            className={`text-xs font-medium mt-0.5 ${
              trend.positive ? 'text-success-500' : 'text-danger-500'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </button>
  );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard;
