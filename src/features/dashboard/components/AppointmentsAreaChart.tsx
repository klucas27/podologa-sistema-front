import React, { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartDataPoint } from '@/types';

interface AppointmentsAreaChartProps {
  data: ChartDataPoint[];
  movingAverage: ChartDataPoint[];
}

const AppointmentsAreaChart: React.FC<AppointmentsAreaChartProps> = ({
  data,
  movingAverage,
}) => {
  const chartData = useMemo(
    () =>
      data.map((point, index) => ({
        label: point.label,
        value: point.value,
        media: movingAverage[index]?.value ?? 0,
      })),
    [data, movingAverage],
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Atendimentos</h2>
          <p className="text-xs text-gray-400 mt-0.5">Evolução com média móvel</p>
        </div>
      </div>

      <div className="px-2 py-4" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorAtendimentos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ABAB5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0ABAB5" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Legend verticalAlign="top" height={36} iconType="line" />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0ABAB5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAtendimentos)"
              name="Atendimentos"
              dot={{ r: 3, fill: '#0ABAB5', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#0ABAB5', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="media"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Média Móvel"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AppointmentsAreaChart;
