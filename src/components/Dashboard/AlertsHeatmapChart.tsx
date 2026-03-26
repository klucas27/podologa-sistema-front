import React, { useMemo } from 'react';
import type { HeatmapDataPoint } from '@/types';

interface AlertsHeatmapChartProps {
  data: HeatmapDataPoint[];
}

const OVERDUE_LABELS: Record<string, string> = {
  '1-3d': '1-3 dias',
  '4-7d': '4-7 dias',
  '8-14d': '8-14 dias',
  '15-30d': '15-30 dias',
  '30+d': '30+ dias',
};

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const CATEGORIES = ['1-3d', '4-7d', '8-14d', '15-30d', '30+d'];

const getColor = (value: number, max: number): string => {
  if (value === 0 || max === 0) return '#f3f4f6';
  const intensity = value / max;
  if (intensity <= 0.25) return '#fef3c7';
  if (intensity <= 0.5) return '#fbbf24';
  if (intensity <= 0.75) return '#f97316';
  return '#ef4444';
};

const AlertsHeatmapChart: React.FC<AlertsHeatmapChartProps> = ({ data }) => {
  const { grid, maxValue } = useMemo(() => {
    const map = new Map<string, number>();
    let max = 0;
    for (const point of data) {
      const key = `${point.x}|${point.y}`;
      map.set(key, point.value);
      if (point.value > max) max = point.value;
    }
    return { grid: map, maxValue: max };
  }, [data]);

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            Alertas de Retorno
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Mapa de calor — criticidade por dia
          </p>
        </div>
      </div>

      <div className="px-5 py-4 overflow-x-auto">
        <div className="min-w-[420px]">
          {/* Header row */}
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `100px repeat(${DAYS.length}, 1fr)`,
            }}
          >
            <div />
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              className="grid gap-1 mt-1"
              style={{
                gridTemplateColumns: `100px repeat(${DAYS.length}, 1fr)`,
              }}
            >
              <div className="text-xs text-gray-500 flex items-center">
                {OVERDUE_LABELS[cat]}
              </div>
              {DAYS.map((day) => {
                const value = grid.get(`${day}|${cat}`) ?? 0;
                return (
                  <div
                    key={`${day}-${cat}`}
                    className="rounded-md flex items-center justify-center text-xs font-medium h-10 transition-colors"
                    style={{ backgroundColor: getColor(value, maxValue) }}
                    title={`${day} • ${OVERDUE_LABELS[cat]}: ${value} paciente(s)`}
                  >
                    {value > 0 ? value : ''}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
            <span>Menos</span>
            {['#f3f4f6', '#fef3c7', '#fbbf24', '#f97316', '#ef4444'].map(
              (color) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
              ),
            )}
            <span>Mais</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsHeatmapChart;
