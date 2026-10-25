import type { Appointment, AppointmentStatus } from "@/types";
import { nowSPISO } from "@/lib/dateUtils";

export const SLOT_HEIGHT = 60;
export const DEFAULT_DURATION_MIN = 60;
export const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: "bg-amber-50 border-amber-400 border-dashed text-amber-800",
  no_show: "bg-red-50 border-red-300 text-red-700",
  scheduled: "bg-blue-100 border-blue-300 text-blue-800",
  confirmed: "bg-cyan-100 border-cyan-300 text-cyan-800",
  in_progress: "bg-yellow-100 border-yellow-300 text-yellow-800",
  cancelled: "bg-gray-100 border-gray-300 text-gray-500 line-through",
  completed: "bg-green-100 border-green-300 text-green-800",
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pedido pelo link",
  no_show: "Faltou",
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

/** Agendado/confirmado com início já passado: a recepção pode marcar falta. */
export const isNoShowCandidate = (appt: Appointment, now = nowSPISO()): boolean =>
  (appt.status === "scheduled" || appt.status === "confirmed") && appt.scheduledStart < now;

export const NO_SHOW_BUTTON =
  "absolute bottom-0.5 right-0.5 z-20 min-h-11 min-w-11 rounded-md border border-danger-200 bg-white/95 px-2 text-xs font-medium text-danger-700 shadow-sm";
