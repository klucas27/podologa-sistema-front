import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { useActiveProfessionals } from "@/features/professionals/hooks/useProfessionals";
import KpiFilters, { presetRange, type KpiFilterState } from "@/features/dashboard/components/KpiFilters";
import { fmtMoney, fmtInt } from "@/features/dashboard/components/kpiFormat";
import { useCommissions } from "../hooks/useCommissions";
import { commissionService, type CommissionItem } from "../services/commission.service";

const pct = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

/** Regra aplicada no pagamento: "40%", "R$ 5,00" ou "40% + R$ 5,00". */
export function commissionRule(item: Pick<CommissionItem, "rate" | "fixed">): string {
  const parts = [
    item.rate !== null && item.rate > 0 ? pct(item.rate) : null,
    item.fixed !== null && item.fixed > 0 ? fmtMoney(item.fixed) : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" + ") : "—";
}

const ComissoesPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [filters, setFilters] = useState<KpiFilterState>(() => ({ preset: "month", ...presetRange("month"), professionalId: "" }));
  const query = { from: filters.from, to: filters.to, professionalId: isAdmin ? filters.professionalId || undefined : undefined };
  const { data, isLoading, error } = useCommissions(query);
  const { data: professionals = [] } = useActiveProfessionals();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const download = async () => {
    setDownloading(true);
    setDownloadError("");
    try {
      await commissionService.downloadCsv(query);
    } catch (err) {
      setDownloadError((err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ErrorBoundary featureName="Comissões">
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{isAdmin ? "Comissões" : "Minhas comissões"}</h1>
              <p className="text-sm text-gray-500 mt-1">Cobranças pagas no período, com a regra gravada no pagamento.</p>
            </div>
            <Button type="button" variant="secondary" icon={<Download size={16} />} isLoading={downloading}
              onClick={() => void download()} className="min-h-11">
              Baixar CSV
            </Button>
          </div>
          <KpiFilters value={filters} onChange={setFilters} professionals={isAdmin ? professionals : null} />
          {downloadError && <p className="text-sm text-danger-600">{downloadError}</p>}
        </div>

        {error && !data && <p className="text-sm text-danger-600">{(error as Error).message || "Erro ao carregar comissões."}</p>}
        {isLoading && !data && <div className="flex justify-center p-12"><Loader2 size={24} className="animate-spin text-primary-500" /></div>}

        {data && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                <p className="text-sm text-primary-700">Total de comissões</p>
                <p className="text-2xl font-bold text-primary-800 mt-1">{fmtMoney(data.total)}</p>
              </div>
              {data.byProfessional.map((p) => (
                <div key={p.professionalId} className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700">{p.name}</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{fmtMoney(p.commission)}</p>
                  <p className="text-xs text-gray-500 mt-1">{fmtInt(p.count)} atendimentos · líquido {fmtMoney(p.net)}</p>
                </div>
              ))}
            </div>

            {data.truncated && (
              <p role="note" className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm">
                Mostrando os primeiros 2.000 itens. Baixe o CSV para ver todos.
              </p>
            )}

            {data.items.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma comissão no período.</p>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Data</th>
                      <th className="px-4 py-3 font-medium">Cliente</th>
                      <th className="px-4 py-3 font-medium">Serviço</th>
                      <th className="px-4 py-3 font-medium">Profissional</th>
                      <th className="px-4 py-3 font-medium text-right">Líquido</th>
                      <th className="px-4 py-3 font-medium">Regra</th>
                      <th className="px-4 py-3 font-medium text-right">Comissão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.items.map((i) => (
                      <tr key={i.billingId}>
                        <td className="px-4 py-3 whitespace-nowrap">{i.paidAt}</td>
                        <td className="px-4 py-3">{i.patientFirstName}</td>
                        <td className="px-4 py-3">{i.serviceName ?? "—"}</td>
                        <td className="px-4 py-3">{i.professionalName}</td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">{fmtMoney(i.net)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{commissionRule(i)}</td>
                        <td className="px-4 py-3 text-right font-medium whitespace-nowrap">{fmtMoney(i.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ComissoesPage;
