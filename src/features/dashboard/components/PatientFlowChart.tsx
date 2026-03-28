import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MoreVertical } from 'lucide-react';

export interface FlowDataPoint {
  day: string;
  pacientes: number;
}

interface PatientFlowChartProps {
  data: FlowDataPoint[];
}

const PatientFlowChart: React.FC<PatientFlowChartProps> = ({ data }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Fluxo de Pacientes</h2>
          <p className="text-xs text-gray-400 mt-0.5">Últimos 7 dias</p>
        </div>
        <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title='icon-more'>
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="px-2 py-4" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPacientes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ABAB5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0ABAB5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="day"
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
            <Area
              type="monotone"
              dataKey="pacientes"
              stroke="#0ABAB5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorPacientes)"
              name="Pacientes"
              dot={{ r: 3, fill: '#0ABAB5', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#0ABAB5', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PatientFlowChart;
