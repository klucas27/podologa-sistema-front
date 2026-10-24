import React from "react";
import type { Kpis } from "../services/kpi.service";
import { fmtInt, fmtMinutes, fmtMoney, fmtPct } from "./kpiFormat";

interface Tile {
  label: string;
  value: string;
  hint?: string;
}

/** Cartões dos indicadores; `null` vira "—" (sem base no período). */
export function kpiTiles(k: Kpis): Tile[] {
  const tiles: Tile[] = [
    { label: "Faturamento", value: fmtMoney(k.revenue.total), hint: "pago no período, já com desconto" },
    { label: "Ticket médio", value: fmtMoney(k.averageTicket) },
    { label: "Clientes ativas", value: fmtInt(k.clients.active90d), hint: "atendidas nos últimos 90 dias" },
    { label: "Clientes novas", value: fmtInt(k.clients.newInPeriod) },
    { label: "Agendado pelo link", value: fmtPct(k.linkShare) },
    { label: "Tempo de confirmação", value: fmtMinutes(k.confirmationMinutes), hint: "pedidos do link" },
    { label: "Faltas", value: fmtPct(k.noShowRate) },
    { label: "Cancelamentos", value: fmtPct(k.cancellationRate) },
    { label: "Ocupação da agenda", value: k.occupancy ? fmtPct(k.occupancy.overall) : "—" },
    { label: "Atraso médio", value: fmtMinutes(k.punctuality.averageDelayMinutes), hint: `${fmtPct(k.punctuality.lateShare)} com mais de 10 min` },
    { label: "Encaminhamentos concluídos", value: fmtPct(k.referralConversion) },
    { label: "Retorno realizado", value: fmtPct(k.returnRate) },
  ];
  if (k.commissions) tiles.push({ label: "Comissões a pagar", value: fmtMoney(k.commissions.total) });
  return tiles;
}

const KpiGrid: React.FC<{ kpis: Kpis }> = ({ kpis }) => (
  <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
    {kpiTiles(kpis).map((t) => (
      <li key={t.label} className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-medium text-gray-500">{t.label}</p>
        <p className="mt-1 text-xl font-bold text-gray-800">{t.value}</p>
        {t.hint && <p className="mt-0.5 text-xs text-gray-400">{t.hint}</p>}
      </li>
    ))}
  </ul>
);

export default KpiGrid;
