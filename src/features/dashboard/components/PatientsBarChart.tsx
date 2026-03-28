import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartDataPoint } from '@/types';

interface PatientsBarChartProps {
  current: ChartDataPoint[];
  previous: ChartDataPoint[];
}

const PatientsBarChart: React.FC<PatientsBarChartProps> = ({
  current,
  previous,
}) => {
  const chartData = useMemo(
    () =>
      current.map((point, index) => ({
        label: point.label,
        atual: point.value,
        anterior: previous[index]?.value ?? 0,
      })),
    [current, previous],
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            Novos Pacientes
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Período atual vs anterior
          </p>
        </div>
      </div>

      <div className="px-2 py-4" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />
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
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.8125rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.06)',
              }}
              labelStyle={{ color: '#374151', fontWeight: 600 }}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar
              dataKey="atual"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              name="Período Atual"
            />
            <Bar
              dataKey="anterior"
              fill="#bbf7d0"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              name="Período Anterior"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PatientsBarChart;
