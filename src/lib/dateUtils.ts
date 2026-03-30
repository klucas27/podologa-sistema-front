/**
 * Utilitário central de formatação de data/hora.
 *
 * - Todas as datas armazenadas no banco estão em horário de São Paulo.
 * - Os valores trafegam com sufixo Z, mas representam horário de SP.
 * - Formatadores usam timeZone "UTC" porque os slots UTC já contêm SP.
 * - Localidade: pt-BR, formato 24h.
 * - NUNCA usar new Date() para "agora" — usar nowSPISO().
 */

const LOCALE = "pt-BR";

// ── Helpers internos ─────────────────────────────────────────

/**
 * Converte string/Date em Date de forma segura.
 * Strings date-only (YYYY-MM-DD) recebem T12:00:00Z para evitar
 * troca de dia.
 */
function toSafeDate(value: string | Date): Date {
  if (typeof value !== "string") return value;
  return new Date(value.length === 10 ? value + "T12:00:00Z" : value);
}

// ── Formatadores pré-instanciados (performance) ─────────────
// timeZone: "UTC" porque as datas do banco já têm SP nos slots UTC.

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const monthYearFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: "UTC",
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

const shortMonthYearFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: "UTC",
  month: "short",
  year: "numeric",
});

/** "mar. de 2026" */
export function formatShortMonthYear(value: string | Date): string {
  const d = toSafeDate(value);
  return shortMonthYearFmt.format(d);
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

/**
 * Extrai a data YYYY-MM-DD dos slots UTC (que contêm horário de SP).
 *
 * Aceita strings ISO e date-only.
 */
export function toDateInTz(value: string | Date): string {
  const d = typeof value === "string" ? toSafeDate(value) : value;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Extrai hora e minuto dos slots UTC (que contêm horário de SP). */
export function getHoursInTz(value: string | Date): { hours: number; minutes: number } {
  const d = typeof value === "string" ? new Date(value) : value;
  return { hours: d.getUTCHours(), minutes: d.getUTCMinutes() };
}

/**
 * Retorna agora em horário de SP como ISO string — para enviar ao backend.
 * Usa Intl para garantir horário de SP independente do fuso do dispositivo.
 */
export function nowSPISO(): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}.000Z`;
}

/**
 * Converte data "YYYY-MM-DD" + hora "HH:MM" (horário de São Paulo)
 * para string ISO, pronta para enviar ao backend.
 * Sem conversão — o backend armazena horário de SP diretamente.
 */
export function spDateTimeToISO(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00.000Z`;
}

/**
 * Formata data longa em SP.
 * Ex.: "sábado, 28 de março de 2026"
 */
const longDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function formatLongDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = toSafeDate(value);
  if (isNaN(d.getTime())) return "—";
  return longDateFormatter.format(d);
}
