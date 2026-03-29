import React from "react";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import MetricCard from "../components/MetricCard";
import UpcomingAppointments from "../components/UpcomingAppointments";
import AppointmentsAreaChart from "../components/AppointmentsAreaChart";
import PatientsBarChart from "../components/PatientsBarChart";
import RevenueWaterfallChart from "../components/RevenueWaterfallChart";
import AlertsHeatmapChart from "../components/AlertsHeatmapChart";
import PeriodFilter from "../components/PeriodFilter";
import ReturnAlertsList from "../components/ReturnAlertsList";
import { useDashboardPage } from "../hooks/useDashboardPage";

const DashboardChart: React.FC<{
  activeKpi: string;
  data: NonNullable<ReturnType<typeof useDashboardPage>["data"]>;
}> = ({ activeKpi, data }) => {
  switch (activeKpi) {
    case "appointments":
      return (
        <AppointmentsAreaChart
          data={data.chartData}
          movingAverage={data.movingAverage}
        />
      );
    case "patients":
      return (
        <PatientsBarChart
          current={data.chartData}
          previous={data.previousPeriodData}
        />
      );
    case "revenue":
      return <RevenueWaterfallChart data={data.waterfallData} />;
    case "alerts":
      return <AlertsHeatmapChart data={data.heatmapData} />;
    default:
      return null;
  }
};

const DashboardPage: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    activeKpi,
    period,
    metricCards,
    appointments,
    showReturnAlerts,
    handleKpiClick,
    handlePeriodChange,
  } = useDashboardPage();

  if (isLoading && !data) {
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
    <ErrorBoundary featureName="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Visão geral do seu consultório —{" "}
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <PeriodFilter selected={period} onChange={handlePeriodChange} />
        </div>

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

        {isLoading && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
          </div>
        )}

        {error && data && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
            Erro ao atualizar dados: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5">
          <div className="lg:col-span-3">
            <DashboardChart activeKpi={activeKpi} data={data} />
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
    </ErrorBoundary>
  );
};

export default DashboardPage;
