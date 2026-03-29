import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint, KpiType } from '@/types';
import { formatCurrency } from '@/lib/dateUtils';

const KPI_CONFIG: Record<KpiType, { title: string; color: string; dataKey: string }> = {
  appointments: { title: 'Atendimentos', color: '#0ABAB5', dataKey: 'value' },
  patients: { title: 'Novos Pacientes', color: '#22c55e', dataKey: 'value' },
  revenue: { title: 'Faturamento (R$)', color: '#f59e0b', dataKey: 'value' },
  alerts: { title: 'Alertas de Retorno', color: '#ef4444', dataKey: 'value' },
};

interface DashboardChartProps {
  data: ChartDataPoint[];
  kpi: KpiType;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ data, kpi }) => {
  const config = KPI_CONFIG[kpi];

  const formatValue = useMemo(() => {
    if (kpi === 'revenue') {
      return (val: number) => formatCurrency(val);
    }
    return (val: number) => String(val);
  }, [kpi]);

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-800">{config.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Por período selecionado</p>
        </div>
      </div>

      <div className="px-2 py-4" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={kpi === 'revenue'}
              tickFormatter={kpi === 'revenue' ? (v: number) => `R$${v}` : undefined}
            />
            <Tooltip
              formatter={(val) => [formatValue(Number(val ?? 0)), config.title]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.8125rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.06)',
              }}
              labelStyle={{ color: '#374151', fontWeight: 600 }}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />
            <Bar
              dataKey="value"
              fill={config.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              name={config.title}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;
