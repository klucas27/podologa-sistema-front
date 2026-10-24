import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { isProfessionalRole } from "@/config/permissions";
import { formatLongDate } from "@/lib/dateUtils";
import { useActiveProfessionals } from "@/features/professionals/hooks/useProfessionals";
import { useBookingRequests } from "@/features/booking-requests/hooks/useBookingRequests";
import { useKpis } from "../hooks/useKpis";
import KpiFilters, { presetRange } from "../components/KpiFilters";
import type { KpiFilterState } from "../components/KpiFilters";
import KpiGrid from "../components/KpiGrid";
import ProfessionalBarChart from "../components/ProfessionalBarChart";
import AcquisitionChart from "../components/AcquisitionChart";
import AlertsPanel from "../components/AlertsPanel";
import LegacyDashboard from "../components/LegacyDashboard";

const DashboardPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const own = isProfessionalRole(role);
  const canManage = role === "admin" || role === "recepcao";
  const [filters, setFilters] = useState<KpiFilterState>(() => ({ preset: "month", ...presetRange("month"), professionalId: "" }));

  const { data: kpis, isLoading, error } = useKpis({
    from: filters.from, to: filters.to, professionalId: own ? undefined : filters.professionalId || undefined,
  });
  const { data: professionals = [] } = useActiveProfessionals();
  const pending = useBookingRequests(canManage);

  return (
    <ErrorBoundary featureName="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{own ? "Meus indicadores" : "Indicadores"}</h1>
            <p className="text-sm text-gray-500 mt-1">{formatLongDate(new Date())}</p>
          </div>
          <KpiFilters value={filters} onChange={setFilters} professionals={canManage ? professionals : null} />
        </div>

        <AlertsPanel stock={kpis?.stock} pendingRequests={canManage ? pending.data?.length ?? 0 : null} />

        {error && !kpis && <p className="text-sm text-danger-600">{(error as Error).message || "Erro ao carregar indicadores."}</p>}
        {isLoading && !kpis && <div className="flex justify-center p-12"><Loader2 size={24} className="animate-spin text-primary-500" /></div>}

        {kpis && (
          <>
            {kpis.warnings.includes("occupancy_period_too_long") && (
              <p role="note" className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm">
                Ocupação da agenda só é calculada para períodos de até 92 dias.
              </p>
            )}
            <KpiGrid kpis={kpis} />
            <div className="grid gap-4 lg:grid-cols-2">
              {!own && <ProfessionalBarChart title="Faturamento por profissional" data={kpis.revenue.byProfessional} />}
              <ProfessionalBarChart title="Faturamento por serviço" data={kpis.revenue.byService} />
              {kpis.commissions && !own && <ProfessionalBarChart title="Comissões por profissional" data={kpis.commissions.byProfessional} />}
              <AcquisitionChart data={kpis.acquisition} />
            </div>
          </>
        )}

        {isAdmin && <LegacyDashboard />}
      </div>
    </ErrorBoundary>
  );
};

export default DashboardPage;
