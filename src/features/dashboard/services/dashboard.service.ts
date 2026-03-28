import { api } from "@/lib/api";
import type { DashboardData, KpiType, PeriodType } from "@/types";

interface ApiResponse<T> {
  status: string;
  data: T;
}

export const dashboardService = {
  getData: (kpi: KpiType = "appointments", period: PeriodType = "weekly") =>
    api
      .get<ApiResponse<DashboardData>>("/api/dashboard", {
        params: { kpi, period },
      })
      .then((res) => res.data),
};
