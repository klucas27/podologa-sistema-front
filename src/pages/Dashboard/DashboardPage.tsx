import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Users,
  DollarSign,
  BellRing,
  Loader2,
} from 'lucide-react';
import MetricCard from '@/components/Dashboard/MetricCard';
import UpcomingAppointments from '@/components/Dashboard/UpcomingAppointments';
import AppointmentsAreaChart from '@/components/Dashboard/AppointmentsAreaChart';
import PatientsBarChart from '@/components/Dashboard/PatientsBarChart';
import RevenueWaterfallChart from '@/components/Dashboard/RevenueWaterfallChart';
import AlertsHeatmapChart from '@/components/Dashboard/AlertsHeatmapChart';
import PeriodFilter from '@/components/Dashboard/PeriodFilter';
import ReturnAlertsList from '@/components/Dashboard/ReturnAlertsList';
import type { AppointmentItem } from '@/components/Dashboard/UpcomingAppointments';
import type { DashboardData, KpiType, PeriodType } from '@/types';
import { dashboardService } from '@/services/dashboard.service';

const statusMap: Record<string, AppointmentItem['status']> = {
  scheduled: 'agendado',
  confirmed: 'confirmado',
  in_progress: 'em_atendimento',
  completed: 'concluido',
  cancelled: 'cancelado',
};

const formatCurrency = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PERIOD_LABELS: Record<PeriodType, { appointments: string; patients: string; revenue: string }> = {
  daily: { appointments: 'Atendimentos Hoje', patients: 'Novos Pac. Hoje', revenue: 'Faturamento Hoje' },
  weekly: { appointments: 'Atend. na Semana', patients: 'Novos Pac. Semana', revenue: 'Fat. Semanal' },
  monthly: { appointments: 'Atend. no Mês', patients: 'Novos Pac. Mês', revenue: 'Fat. Mensal' },
  annual: { appointments: 'Atend. no Ano', patients: 'Novos Pac. Ano', revenue: 'Fat. Anual' },
};

const PERIOD_TREND_SUFFIX: Record<PeriodType, string> = {
  daily: 'vs ontem',
  weekly: 'vs semana anterior',
  monthly: 'vs mês anterior',
  annual: 'vs ano anterior',
};

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeKpi, setActiveKpi] = useState<KpiType>('appointments');
  const [period, setPeriod] = useState<PeriodType>('weekly');

  const fetchData = useCallback(async (kpi: KpiType, p: PeriodType) => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardService.getData(kpi, p);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeKpi, period);
  }, [activeKpi, period, fetchData]);

  const handleKpiClick = useCallback((kpi: KpiType) => {
    setActiveKpi(kpi);
  }, []);

  const handlePeriodChange = useCallback((p: PeriodType) => {
    setPeriod(p);
  }, []);

  // Determine which sidebar list to show based on active KPI
  const showReturnAlerts = activeKpi === 'alerts';

  const metricCards = useMemo(() => {
    if (!data) return [];
    const { metrics } = data;
    const labels = PERIOD_LABELS[period];
    const trendSuffix = PERIOD_TREND_SUFFIX[period];

    const appointmentDiff = metrics.appointmentsPrevious
      ? Math.round(((metrics.appointments - metrics.appointmentsPrevious) / metrics.appointmentsPrevious) * 100)
      : 0;

    const patientDiff = metrics.newPatientsPrevious
      ? Math.round(((metrics.newPatients - metrics.newPatientsPrevious) / metrics.newPatientsPrevious) * 100)
      : 0;

    const revenueDiff = metrics.revenuePrevious
      ? Math.round(((metrics.revenue - metrics.revenuePrevious) / metrics.revenuePrevious) * 100)
      : 0;

    return [
      {
        kpi: 'appointments' as KpiType,
        label: labels.appointments,
        value: metrics.appointments,
        icon: CalendarDays,
        colorClass: 'bg-primary-50 text-primary-600',
        trend: {
          value: `${appointmentDiff >= 0 ? '+' : ''}${appointmentDiff}% ${trendSuffix}`,
          positive: appointmentDiff >= 0,
        },
      },
      {
        kpi: 'patients' as KpiType,
        label: labels.patients,
        value: metrics.newPatients,
        icon: Users,
        colorClass: 'bg-success-50 text-success-700',
        trend: {
          value: `${patientDiff >= 0 ? '+' : ''}${patientDiff}% ${trendSuffix}`,
          positive: patientDiff >= 0,
        },
      },
      {
        kpi: 'revenue' as KpiType,
        label: labels.revenue,
        value: formatCurrency(metrics.revenue),
        icon: DollarSign,
        colorClass: 'bg-warning-50 text-warning-700',
        trend: {
          value: `${revenueDiff >= 0 ? '+' : ''}${revenueDiff}% ${trendSuffix}`,
          positive: revenueDiff >= 0,
        },
      },
      {
        kpi: 'alerts' as KpiType,
        label: 'Alertas de Retorno',
        value: metrics.returnAlerts.total,
        icon: BellRing,
        colorClass: 'bg-danger-50 text-danger-700',
        trend: {
          value: `${metrics.returnAlerts.urgent} urgentes`,
          positive: metrics.returnAlerts.urgent === 0,
        },
      },
    ];
  }, [data, period]);

  const appointments: AppointmentItem[] = useMemo(() => {
    if (!data) return [];
    return data.todayAppointments.map((apt) => ({
      id: apt.id,
      patient: apt.patient,
      time: apt.time,
      procedure: apt.procedure ?? 'Consulta',
      status: statusMap[apt.status] ?? 'agendado',
    }));
  }, [data]);

  const renderChart = useMemo(() => {
    if (!data) return null;
    switch (activeKpi) {
      case 'appointments':
        return (
          <AppointmentsAreaChart
            data={data.chartData}
            movingAverage={data.movingAverage}
          />
        );
      case 'patients':
        return (
          <PatientsBarChart
            current={data.chartData}
            previous={data.previousPeriodData}
          />
        );
      case 'revenue':
        return <RevenueWaterfallChart data={data.waterfallData} />;
      case 'alerts':
        return <AlertsHeatmapChart data={data.heatmapData} />;
      default:
        return null;
    }
  }, [data, activeKpi]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-danger-500">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header + Period filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visão geral do seu consultório — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <PeriodFilter selected={period} onChange={handlePeriodChange} />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
        {metricCards.map((m) => (
          <MetricCard
            key={m.kpi}
            label={m.label}
            value={m.value}
            icon={m.icon}
            colorClass={m.colorClass}
            trend={m.trend}
            active={activeKpi === m.kpi}
            onClick={() => handleKpiClick(m.kpi)}
          />
        ))}
      </div>

      {/* Loading overlay for chart refresh */}
      {loading && (
        <div className="flex justify-center py-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
        </div>
      )}

      {/* Chart + Sidebar — two columns on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5">
        <div className="lg:col-span-3">
          {renderChart}
        </div>
        <div className="lg:col-span-2">
          {showReturnAlerts ? (
            <ReturnAlertsList alerts={data.returnAlerts} />
          ) : (
            <UpcomingAppointments appointments={appointments} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
