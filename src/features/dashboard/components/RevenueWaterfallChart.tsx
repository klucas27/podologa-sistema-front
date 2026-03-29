import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { WaterfallDataPoint } from '@/types';
import { formatCurrency as _fc } from '@/lib/dateUtils';

interface RevenueWaterfallChartProps {
  data: WaterfallDataPoint[];
}

const formatCurrency = (value: number): string => _fc(Math.abs(value));

const COLORS: Record<string, string> = {
  positive: '#22c55e',
  negative: '#ef4444',
  total: '#0ABAB5',
};

const RevenueWaterfallChart: React.FC<RevenueWaterfallChartProps> = ({
  data,
}) => {
  const chartData = useMemo(() => {
    let running = 0;
    return data.map((point) => {
      if (point.type === 'total') {
        return {
          label: point.label,
          base: 0,
          value: point.value,
          rawValue: point.value,
          type: point.type,
        };
      }
      const base = running;
      const val = point.value;
      running += val;
      return {
        label: point.label,
        base: val < 0 ? base + val : base,
        value: Math.abs(val),
        rawValue: point.value,
        type: point.type,
      };
    });
  }, [data]);

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Faturamento</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Composição do faturamento
          </p>
        </div>
      </div>

      <div className="px-2 py-4" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `R$${v}`}
            />
            <Tooltip
              formatter={(_value, _name, props) => {
                const payload = props.payload as { rawValue: number; label: string };
                return [formatCurrency(payload.rawValue), payload.label];
              }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.8125rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.06)',
              }}
              labelStyle={{ color: '#374151', fontWeight: 600 }}
            />
            <ReferenceLine y={0} stroke="#d1d5db" />
            <Bar dataKey="base" stackId="waterfall" fill="transparent" />
            <Bar
              dataKey="value"
              stackId="waterfall"
              radius={[4, 4, 0, 0]}
              maxBarSize={56}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.type] ?? '#94a3b8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueWaterfallChart;
