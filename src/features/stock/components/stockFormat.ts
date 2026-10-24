import type { StockUnit } from "../services/stock.service";

export const UNIT_LABELS: Record<StockUnit, string> = { un: "un", ml: "ml", g: "g", par: "par" };

export const INPUT_CLASS =
  "w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition";

/** Aceita vírgula como separador decimal. */
export const toNumber = (v: string): number => Number(v.trim().replace(",", "."));

export const formatQty = (v: number, unit: StockUnit) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${UNIT_LABELS[unit]}`;

/** Hoje em São Paulo (YYYY-MM-DD). */
export const todaySP = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

/** "2026-11-10" ou ISO → "10/11/2026" (data pura, sem fuso). */
export function formatDay(value: string | null): string {
  if (!value) return "—";
  const [y, m, d] = value.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/** Vencido (vermelho), vence em até 30 dias (âmbar) ou ok. */
export function expiryTone(value: string | null): "expired" | "soon" | "ok" {
  if (!value) return "ok";
  const day = value.slice(0, 10);
  const today = todaySP();
  if (day < today) return "expired";
  const limit = new Date(Date.parse(`${today}T00:00:00Z`) + 30 * 86_400_000).toISOString().slice(0, 10);
  return day <= limit ? "soon" : "ok";
}

export const TONE_CLASS = { expired: "text-danger-600 font-semibold", soon: "text-amber-600 font-semibold", ok: "text-gray-600" } as const;
