import type { AppointmentStatus } from "@/types";

export const SLOT_HEIGHT = 60;
export const DEFAULT_DURATION_MIN = 60;
export const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 border-blue-300 text-blue-800",
  confirmed: "bg-cyan-100 border-cyan-300 text-cyan-800",
  in_progress: "bg-yellow-100 border-yellow-300 text-yellow-800",
  cancelled: "bg-gray-100 border-gray-300 text-gray-500 line-through",
  completed: "bg-green-100 border-green-300 text-green-800",
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Agendada",
  confirmed: "Confirmada",
  in_progress: "Em atendimento",
  cancelled: "Cancelada",
  completed: "Concluída",
};

export const getMonday = (d: Date): Date => {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const addDays = (d: Date, n: number): Date => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

export { toISODate as formatDateISO, formatMonthYear } from "@/lib/dateUtils";

export const formatDayNum = (d: Date): string => String(d.getDate());

export const pad2 = (n: number): string => String(n).padStart(2, "0");

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const parseLocalDate = (dateStr: string): Date => {
  const isoDate = dateStr.slice(0, 10);
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
};

export const parseTimeHour = (time: string): number => {
  const [h] = time.split(":").map(Number);
  return h!;
};
