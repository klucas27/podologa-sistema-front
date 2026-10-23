/** Janela máxima de uma consulta do link (o back recusa mais que isso). */
export const PUBLIC_WINDOW_DAYS = 14;

/**
 * Teto usado pelo botão "Mais datas" quando a info pública não traz
 * `maxAdvanceDays`. É o padrão da coluna `business_settings.max_advance_days`.
 */
export const PUBLIC_MAX_ADVANCE_DAYS = 30;

export function todaySP(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
}

export function addIsoDays(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + days)).toISOString().slice(0, 10);
}

export function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const label = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDayChip(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
  const week = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' }).format(date);
  const rest = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date);
  return `${week} ${rest}`;
}
