import { useState, useMemo, useCallback } from "react";
import {
  CalendarDays,
  Users,
  DollarSign,
  BellRing,
} from "lucide-react";
import { useDashboard } from "./useDashboard";
import type { KpiType, PeriodType, DashboardData } from "@/types";
import type { AppointmentItem } from "../components/UpcomingAppointments";

const STATUS_MAP: Record<string, AppointmentItem["status"]> = {
  scheduled: "agendado",
  confirmed: "confirmado",
  in_progress: "em_atendimento",
  completed: "concluido",
  cancelled: "cancelado",
};

const formatCurrency = (value: number): string =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PERIOD_LABELS: Record<
  PeriodType,
  { appointments: string; patients: string; revenue: string }
> = {
  daily: {
    appointments: "Atendimentos Hoje",
    patients: "Novos Pac. Hoje",
    revenue: "Faturamento Hoje",
  },
  weekly: {
    appointments: "Atend. na Semana",
    patients: "Novos Pac. Semana",
    revenue: "Fat. Semanal",
  },
  monthly: {
    appointments: "Atend. no Mês",
    patients: "Novos Pac. Mês",
    revenue: "Fat. Mensal",
  },
  annual: {
    appointments: "Atend. no Ano",
    patients: "Novos Pac. Ano",
    revenue: "Fat. Anual",
  },
};

const PERIOD_TREND_SUFFIX: Record<PeriodType, string> = {
  daily: "vs ontem",
  weekly: "vs semana anterior",
  monthly: "vs mês anterior",
  annual: "vs ano anterior",
};

function calcDiff(current: number, previous: number): number {
  return previous ? Math.round(((current - previous) / previous) * 100) : 0;
}

function buildMetricCards(data: DashboardData, period: PeriodType) {
  const { metrics } = data;
  const labels = PERIOD_LABELS[period];
  const trendSuffix = PERIOD_TREND_SUFFIX[period];

  const appointmentDiff = calcDiff(
    metrics.appointments,
    metrics.appointmentsPrevious,
  );
  const patientDiff = calcDiff(
    metrics.newPatients,
    metrics.newPatientsPrevious,
  );
  const revenueDiff = calcDiff(metrics.revenue, metrics.revenuePrevious);

  return [
    {
      kpi: "appointments" as KpiType,
      label: labels.appointments,
      value: metrics.appointments,
      icon: CalendarDays,
      colorClass: "bg-primary-50 text-primary-600",
      trend: {
        value: `${appointmentDiff >= 0 ? "+" : ""}${appointmentDiff}% ${trendSuffix}`,
        positive: appointmentDiff >= 0,
      },
    },
    {
      kpi: "patients" as KpiType,
      label: labels.patients,
      value: metrics.newPatients,
      icon: Users,
      colorClass: "bg-success-50 text-success-700",
      trend: {
        value: `${patientDiff >= 0 ? "+" : ""}${patientDiff}% ${trendSuffix}`,
        positive: patientDiff >= 0,
      },
    },
    {
      kpi: "revenue" as KpiType,
      label: labels.revenue,
      value: formatCurrency(metrics.revenue),
      icon: DollarSign,
      colorClass: "bg-warning-50 text-warning-700",
      trend: {
        value: `${revenueDiff >= 0 ? "+" : ""}${revenueDiff}% ${trendSuffix}`,
        positive: revenueDiff >= 0,
      },
    },
    {
      kpi: "alerts" as KpiType,
      label: "Alertas de Retorno",
      value: metrics.returnAlerts.total,
      icon: BellRing,
      colorClass: "bg-danger-50 text-danger-700",
      trend: {
        value: `${metrics.returnAlerts.urgent} urgentes`,
        positive: metrics.returnAlerts.urgent === 0,
      },
    },
  ];
}

export function useDashboardPage() {
  const [activeKpi, setActiveKpi] = useState<KpiType>("appointments");
  const [period, setPeriod] = useState<PeriodType>("weekly");

  const { data, isLoading, error } = useDashboard(activeKpi, period);

  const handleKpiClick = useCallback((kpi: KpiType) => {
    setActiveKpi(kpi);
  }, []);

  const handlePeriodChange = useCallback((p: PeriodType) => {
    setPeriod(p);
  }, []);

  const metricCards = useMemo(
    () => (data ? buildMetricCards(data, period) : []),
    [data, period],
  );

  const appointments: AppointmentItem[] = useMemo(() => {
    if (!data) return [];
    return data.todayAppointments.map((apt) => ({
      id: apt.id,
      patient: apt.patient,
      time: apt.time,
      procedure: apt.procedure ?? "Consulta",
      status: STATUS_MAP[apt.status] ?? "agendado",
    }));
  }, [data]);

  return {
    data,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    activeKpi,
    period,
    metricCards,
    appointments,
    showReturnAlerts: activeKpi === "alerts",
    handleKpiClick,
    handlePeriodChange,
  };
}
