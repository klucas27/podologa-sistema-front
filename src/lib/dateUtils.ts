/**
 * Utilitário central de formatação de data/hora.
 *
 * - Todas as datas armazenadas no banco estão em UTC (ISO 8601).
 * - A conversão para exibição é feita exclusivamente aqui.
 * - Timezone padrão de exibição: America/Sao_Paulo.
 * - Localidade: pt-BR, formato 24h.
 */

const TIMEZONE = "America/Sao_Paulo";
const LOCALE = "pt-BR";

// ── Helpers internos ─────────────────────────────────────────

/**
 * Converte string/Date em Date de forma segura.
 * Strings date-only (YYYY-MM-DD) recebem T12:00:00 para evitar
 * troca de dia ao converter de UTC para fuso local.
 */
function toSafeDate(value: string | Date): Date {
  if (typeof value !== "string") return value;
  return new Date(value.length === 10 ? value + "T12:00:00" : value);
}

// ── Formatadores pré-instanciados (performance) ─────────────

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const monthYearFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIMEZONE,
  month: "long",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "BRL",
});

// ── Funções públicas ─────────────────────────────────────────

/** "28/03/2026" */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = toSafeDate(value);
  if (isNaN(d.getTime())) return "—";
  return dateFormatter.format(d);
}

/** "21:45" */
export function formatTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = toSafeDate(value);
  if (isNaN(d.getTime())) return "—";
  return timeFormatter.format(d);
}

/** "28/03/2026 21:45" */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = toSafeDate(value);
  if (isNaN(d.getTime())) return "—";
  return dateTimeFormatter.format(d);
}

/** "março de 2026" */
export function formatMonthYear(value: string | Date): string {
  const d = toSafeDate(value);
  return monthYearFormatter.format(d);
}

/** "R$ 1.234,56" */
export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return currencyFormatter.format(num);
}

/** Date → "2026-03-28" (para inputs e chamadas de API — usa timezone LOCAL do browser) */
export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ── Formatador interno para extração de data em SP ───────────

const isoDateInTzFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Extrai a data YYYY-MM-DD no fuso America/Sao_Paulo.
 *
 * Diferente de toISODate (que usa timezone do browser),
 * esta função extrai o dia REAL conforme São Paulo.
 *
 * Aceita strings ISO ("2026-03-28T02:00:00Z") e date-only ("2026-03-28").
 */
export function toDateInTz(value: string | Date): string {
  const d = typeof value === "string" ? toSafeDate(value) : value;
  const parts = isoDateInTzFormatter.formatToParts(d);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const dd = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${dd}`;
}

/** Extrai hora e minuto no fuso America/Sao_Paulo (para posicionamento no grid). */
export function getHoursInTz(value: string | Date): { hours: number; minutes: number } {
  const d = typeof value === "string" ? new Date(value) : value;
  const parts = timeFormatter.formatToParts(d);
  const hours = parseInt(parts.find((p) => p.type === "hour")!.value, 10);
  const minutes = parseInt(parts.find((p) => p.type === "minute")!.value, 10);
  return { hours, minutes };
}
