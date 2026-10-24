import React from "react";
import { addDays, todaySP } from "./kpiFormat";

export type Preset = "today" | "week" | "month" | "custom";

export interface KpiFilterState {
  preset: Preset;
  from: string;
  to: string;
  professionalId: string;
}

/** Período de cada atalho: hoje, últimos 7 dias e mês corrente (até hoje). */
export function presetRange(preset: Exclude<Preset, "custom">): { from: string; to: string } {
  const today = todaySP();
  if (preset === "today") return { from: today, to: today };
  if (preset === "week") return { from: addDays(today, -6), to: today };
  return { from: `${today.slice(0, 8)}01`, to: today };
}

const PRESETS: [Preset, string][] = [["today", "Hoje"], ["week", "Semana"], ["month", "Mês"], ["custom", "Personalizado"]];
const INPUT = "px-3 py-2 min-h-11 rounded-lg border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-primary-400 outline-none";

interface Props {
  value: KpiFilterState;
  onChange: (v: KpiFilterState) => void;
  professionals: { id: string; fullName: string }[] | null; // null = sem filtro de profissional
}

const KpiFilters: React.FC<Props> = ({ value, onChange, professionals }) => (
  <div className="flex flex-col lg:flex-row lg:items-end gap-3">
    <div role="group" aria-label="Período" className="grid grid-cols-4 gap-1 bg-gray-100 rounded-lg p-1">
      {PRESETS.map(([preset, label]) => (
        <button key={preset} type="button" aria-pressed={value.preset === preset}
          onClick={() => onChange(preset === "custom" ? { ...value, preset } : { ...value, preset, ...presetRange(preset) })}
          className={`min-h-11 px-3 text-sm font-medium rounded-md transition ${value.preset === preset ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          {label}
        </button>
      ))}
    </div>
    {value.preset === "custom" && (
      <div className="flex gap-2">
        <label className="text-xs text-gray-500">De<input type="date" aria-label="De" value={value.from} max={value.to} onChange={(e) => e.target.value && onChange({ ...value, from: e.target.value })} className={`${INPUT} block`} /></label>
        <label className="text-xs text-gray-500">Até<input type="date" aria-label="Até" value={value.to} min={value.from} onChange={(e) => e.target.value && onChange({ ...value, to: e.target.value })} className={`${INPUT} block`} /></label>
      </div>
    )}
    {professionals && (
      <select aria-label="Profissional" value={value.professionalId} onChange={(e) => onChange({ ...value, professionalId: e.target.value })} className={INPUT}>
        <option value="">Todas as profissionais</option>
        {professionals.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
      </select>
    )}
  </div>
);

export default KpiFilters;
