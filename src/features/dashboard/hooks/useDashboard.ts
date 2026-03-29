import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";
import type { KpiType, PeriodType } from "@/types";

export function useDashboard(kpi: KpiType, period: PeriodType) {
  return useQuery({
    queryKey: ["dashboard", kpi, period],
    queryFn: () => dashboardService.getData(kpi, period),
    placeholderData: keepPreviousData,
  });
}
