import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  colorClass: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  colorClass,
}) => {
  return (
    <div className="card card-body flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
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
    </div>
  );
};

export default MetricCard;
