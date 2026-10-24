import { api } from "@/lib/api";

interface ApiResponse<T> {
  data: T;
}

export interface NamedTotal {
  name: string | null;
  total: number;
}

export interface Kpis {
  period: { from: string; to: string };
  professionalId: string | null;
  revenue: {
    total: number;
    byProfessional: (NamedTotal & { professionalId: string })[];
    byService: (NamedTotal & { serviceId: string | null })[];
  };
  averageTicket: number | null;
  clients: { active90d: number; newInPeriod: number };
  linkShare: number | null;
  confirmationMinutes: number | null;
  noShowRate: number | null;
  cancellationRate: number | null;
  acquisition: { source: string | null; count: number }[];
  occupancy: { overall: number | null; byProfessional: { professionalId: string; name: string; rate: number | null }[] } | null;
  punctuality: { averageDelayMinutes: number | null; lateShare: number | null };
  referralConversion: number | null;
  returnRate: number | null;
  warnings: string[];
  commissions?: { total: number; byProfessional: (NamedTotal & { professionalId: string })[] };
  stock?: { expiring: number; belowMin: number; shortages: number };
}

export interface KpiQuery {
  from: string;
  to: string;
  professionalId?: string;
}

export const kpiService = {
  get: (q: KpiQuery) =>
    api
      .get<ApiResponse<Kpis>>("/api/dashboard/kpis", {
        params: { from: q.from, to: q.to, ...(q.professionalId ? { professionalId: q.professionalId } : {}) },
      })
      .then((res) => res.data),
};
