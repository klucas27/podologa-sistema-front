const DASH = "—";

export const fmtMoney = (v: number | null | undefined) =>
  v === null || v === undefined ? DASH : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** 0,2222 → "22,2%" */
export const fmtPct = (v: number | null | undefined) =>
  v === null || v === undefined ? DASH : `${(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

export const fmtMinutes = (v: number | null | undefined) =>
  v === null || v === undefined ? DASH : `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} min`;

export const fmtInt = (v: number | null | undefined) => (v === null || v === undefined ? DASH : v.toLocaleString("pt-BR"));

export const SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram", indicacao: "Indicação", google: "Google", passagem: "Passagem", link: "Link", outro: "Outro",
};

/** Hoje em São Paulo (YYYY-MM-DD). */
export const todaySP = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

export const addDays = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
