import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { commissionService, type CommissionQuery } from "../services/commission.service";

export function useCommissions(query: CommissionQuery) {
  return useQuery({
    queryKey: ["commissions", query.from, query.to, query.professionalId ?? ""],
    queryFn: () => commissionService.report(query),
    placeholderData: keepPreviousData,
  });
}
