import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { kpiService } from "../services/kpi.service";
import type { KpiQuery } from "../services/kpi.service";

export function useKpis(query: KpiQuery) {
  return useQuery({
    queryKey: ["dashboard", "kpis", query.from, query.to, query.professionalId ?? ""],
    queryFn: () => kpiService.get(query),
    placeholderData: keepPreviousData,
  });
}
