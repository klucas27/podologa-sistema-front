import { api, ApiError } from "@/lib/api";
import { env } from "@/config/env";

interface ApiResponse<T> {
  data: T;
}

export interface CommissionItem {
  billingId: string;
  paidAt: string; // DD/MM/AAAA HH:mm
  patientFirstName: string;
  serviceName: string | null;
  professionalName: string;
  amount: number;
  discount: number;
  net: number;
  rate: number | null;
  fixed: number | null;
  commission: number;
}

export interface CommissionReport {
  period: { from: string; to: string };
  total: number;
  byProfessional: { professionalId: string; name: string; count: number; net: number; commission: number }[];
  items: CommissionItem[];
  truncated: boolean;
}

export interface CommissionQuery {
  from: string;
  to: string;
  professionalId?: string;
}

const params = (q: CommissionQuery): Record<string, string> => ({
  from: q.from,
  to: q.to,
  ...(q.professionalId ? { professionalId: q.professionalId } : {}),
});

export const commissionService = {
  report: (q: CommissionQuery) =>
    api.get<ApiResponse<CommissionReport>>("/api/commissions", { params: params(q) }).then((res) => res.data),

  /** Baixa o CSV via blob (funciona no Safari do iPad, que ignora `download` em links cross-origin). */
  async downloadCsv(q: CommissionQuery): Promise<void> {
    const url = new URL(`${env.VITE_API_URL}/api/commissions/export`, window.location.origin);
    Object.entries(params(q)).forEach(([key, value]) => url.searchParams.set(key, value));
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new ApiError(res.status, "Não foi possível baixar o CSV.");
    const href = URL.createObjectURL(await res.blob());
    const link = document.createElement("a");
    link.href = href;
    link.download = `comissoes-${q.from}_${q.to}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  },
};
