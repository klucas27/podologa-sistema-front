import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  CalendarDays,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import type { Appointment, AppointmentStatus } from "@/types";

/* ─── Constants ─── */
const SLOT_HEIGHT = 60; // px per hour
const DEFAULT_DURATION_MIN = 60;
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 border-blue-300 text-blue-800",
  confirmed: "bg-cyan-100 border-cyan-300 text-cyan-800",
  in_progress: "bg-yellow-100 border-yellow-300 text-yellow-800",
  cancelled: "bg-gray-100 border-gray-300 text-gray-500 line-through",
  completed: "bg-green-100 border-green-300 text-green-800",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Agendada",
  confirmed: "Confirmada",
  in_progress: "Em atendimento",
  cancelled: "Cancelada",
  completed: "Concluída",
};

/* ─── Helpers ─── */
const getMonday = (d: Date): Date => {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const addDays = (d: Date, n: number): Date => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

const formatDateISO = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatMonthYear = (d: Date): string =>
  d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

const formatDayNum = (d: Date): string => String(d.getDate());

const pad2 = (n: number): string => String(n).padStart(2, "0");

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Parses a date string (ISO or datetime) as a LOCAL date,
 * avoiding timezone conversion bugs (UTC midnight → previous day in BRT).
 */
const parseLocalDate = (dateStr: string): Date => {
  const isoDate = dateStr.slice(0, 10);
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
};

const parseTimeHour = (time: string): number => {
  const [h] = time.split(":").map(Number);
  return h!;
};

/* ─── Component ─── */
const AgendamentosPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    appointmentId: string;
    startY: number;
    originalStart: Date;
    originalEnd: Date;
    dayCol: number;
  } | null>(null);

  // Working hours from user settings
  const hourStart = useMemo(
    () => (user?.workdayStart ? parseTimeHour(user.workdayStart) : 8),
    [user?.workdayStart],
  );
  const hourEnd = useMemo(
    () => (user?.workdayEnd ? parseTimeHour(user.workdayEnd) : 18),
    [user?.workdayEnd],
  );

  // Week days array (Mon – Sun)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ data: Appointment[] }>("/api/appointments");
      setAppointments(res.data);
    } catch {
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Scroll to top on week change
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = 0;
    }
  }, [weekStart]);

  const prevWeek = () => setWeekStart((ws) => addDays(ws, -7));
  const nextWeek = () => setWeekStart((ws) => addDays(ws, 7));
  const goToday = () => setWeekStart(getMonday(new Date()));

  // Map appointments to their respective day column
  const appointmentsByDay = useMemo(() => {
    const map: Record<number, Appointment[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];

    appointments.forEach((appt) => {
      const apptDate = parseLocalDate(appt.scheduledDate);
      for (let i = 0; i < 7; i++) {
        if (isSameDay(apptDate, weekDays[i]!)) {
          map[i]!.push(appt);
          break;
        }
      }
    });
    return map;
  }, [appointments, weekDays]);

  // Calculate position & height for an appointment
  const getApptStyle = (appt: Appointment): React.CSSProperties => {
    const start = new Date(appt.scheduledStart);
    const end = new Date(appt.scheduledEnd);
    const startMin = (start.getHours() - hourStart) * 60 + start.getMinutes();
    const endMin = (end.getHours() - hourStart) * 60 + end.getMinutes();
    const top = (startMin / 60) * SLOT_HEIGHT;
    const height = Math.max(((endMin - startMin) / 60) * SLOT_HEIGHT, 20);
    return { top: `${top}px`, height: `${height}px` };
  };

  // Click on empty area to schedule
  const handleSlotClick = (dayIndex: number, hour: number) => {
    const date = weekDays[dayIndex]!;
    const dateStr = formatDateISO(date);
    const startTime = `${pad2(hour)}:00`;
    const endHour = hour + Math.floor(DEFAULT_DURATION_MIN / 60);
    const endMin = DEFAULT_DURATION_MIN % 60;
    const endTime = `${pad2(endHour)}:${pad2(endMin)}`;
    navigate(
      `/consultas/nova?date=${dateStr}&startTime=${startTime}&endTime=${endTime}`,
    );
  };

  // Click on an appointment to open execution page
  const handleAppointmentClick = (appt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/consultas/${appt.id}/execucao`);
  };

  // Drag to move appointment
  const handleDragStart = (
    appt: Appointment,
    dayCol: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setDragState({
      appointmentId: appt.id,
      startY: e.clientY,
      originalStart: new Date(appt.scheduledStart),
      originalEnd: new Date(appt.scheduledEnd),
      dayCol,
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (_e: MouseEvent) => {
      // Visual feedback only — we apply on mouseUp
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (!dragState || !gridRef.current) {
        setDragState(null);
        return;
      }
      const deltaY = e.clientY - dragState.startY;
      const deltaMinutes = Math.round(((deltaY / SLOT_HEIGHT) * 60) / 15) * 15; // snap to 15min

      if (deltaMinutes === 0) {
        setDragState(null);
        return;
      }

      const newStart = new Date(
        dragState.originalStart.getTime() + deltaMinutes * 60000,
      );
      const newEnd = new Date(
        dragState.originalEnd.getTime() + deltaMinutes * 60000,
      );

      // Don't allow dragging outside working hours
      if (newStart.getHours() < hourStart || newEnd.getHours() > hourEnd) {
        setDragState(null);
        return;
      }

      try {
        await api.patch(`/api/appointments/${dragState.appointmentId}`, {
          scheduledStart: newStart.toISOString(),
          scheduledEnd: newEnd.toISOString(),
        });
        await fetchAppointments();
      } catch {
        // revert silently
      }
      setDragState(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, fetchAppointments, hourStart, hourEnd]);

  // Hours array based on working hours
  const hours = useMemo(
    () => Array.from({ length: hourEnd - hourStart }, (_, i) => hourStart + i),
    [hourStart, hourEnd],
  );

  const weekEndDate = weekDays[6]!;
  const headerLabel =
    formatMonthYear(weekStart) === formatMonthYear(weekEndDate)
      ? formatMonthYear(weekStart)
      : `${weekStart.toLocaleDateString("pt-BR", { month: "short" })} – ${weekEndDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`;

  return (
    <div className="flex flex-col h-full -m-4 md:-m-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 md:px-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <CalendarDays size={22} className="text-primary-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-800 capitalize">
              {headerLabel}
            </h1>
            <p className="text-xs text-gray-400">
              Agenda semanal do consultório
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            title="Semana anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Hoje
          </button>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            title="Próxima semana"
          >
            <ChevronRight size={18} />
          </button>
          <Button
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => navigate("/consultas/nova")}
          >
            Novo
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1 p-12">
          <Loader2 size={24} className="animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200 bg-white flex-shrink-0">
            <div className="border-r border-gray-100" /> {/* time gutter */}
            {weekDays.map((d, i) => {
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={i}
                  className={`text-center py-2 border-r border-gray-100 last:border-r-0 ${
                    isToday ? "bg-primary-50" : ""
                  }`}
                >
                  <p className="text-xs text-gray-400 uppercase">
                    {WEEK_DAYS[d.getDay() % 7]}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      isToday ? "text-primary-600" : "text-gray-700"
                    }`}
                  >
                    {formatDayNum(d)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Time grid (scrollable) */}
          <div
            ref={gridRef}
            className="flex-1 overflow-y-auto overflow-x-hidden"
          >
            <div
              className="grid grid-cols-[60px_repeat(7,1fr)] relative"
              style={{ minHeight: `${hours.length * SLOT_HEIGHT}px` }}
            >
              {/* Time labels */}
              <div className="border-r border-gray-100">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="relative border-b border-gray-100"
                    style={{ height: `${SLOT_HEIGHT}px` }}
                  >
                    <span className="absolute -top-2.5 right-2 text-xs text-gray-400 bg-white px-1">
                      {pad2(h)}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((d, dayIdx) => {
                const dayAppts = appointmentsByDay[dayIdx] ?? [];
                const isToday = isSameDay(d, today);

                return (
                  <div
                    key={dayIdx}
                    className={`relative border-r border-gray-100 last:border-r-0 ${
                      isToday ? "bg-primary-50/30" : ""
                    }`}
                  >
                    {/* Hour slots (clickable) */}
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="border-b border-gray-100 cursor-pointer hover:bg-primary-50/50 transition-colors"
                        style={{ height: `${SLOT_HEIGHT}px` }}
                        onClick={() => handleSlotClick(dayIdx, h)}
                      />
                    ))}

                    {/* Appointments overlay */}
                    {dayAppts.map((appt) => {
                      const style = getApptStyle(appt);
                      const colorClass =
                        STATUS_COLORS[appt.status] ??
                        STATUS_COLORS["scheduled"];
                      const startTime = new Date(appt.scheduledStart);
                      const endTime = new Date(appt.scheduledEnd);

                      return (
                        <div
                          key={appt.id}
                          className={`absolute left-0.5 right-0.5 rounded-md border px-1.5 py-0.5 overflow-hidden cursor-pointer transition-shadow hover:shadow-md z-10 ${colorClass}`}
                          style={style}
                          onClick={(e) => handleAppointmentClick(appt, e)}
                          onMouseDown={(e) => handleDragStart(appt, dayIdx, e)}
                          title={`${appt.patient?.fullName ?? "Paciente"} · ${STATUS_LABELS[appt.status]}`}
                        >
                          <p className="text-xs font-semibold truncate leading-tight">
                            {appt.patient?.fullName ?? "Paciente"}
                          </p>
                          <p className="text-[10px] opacity-75 leading-tight">
                            {pad2(startTime.getHours())}:
                            {pad2(startTime.getMinutes())} –{" "}
                            {pad2(endTime.getHours())}:
                            {pad2(endTime.getMinutes())}
                          </p>
                        </div>
                      );
                    })}

                    {/* Current time indicator */}
                    {isToday &&
                      (() => {
                        const now = new Date();
                        const nowMin =
                          (now.getHours() - hourStart) * 60 + now.getMinutes();
                        if (nowMin < 0 || nowMin > (hourEnd - hourStart) * 60)
                          return null;
                        const top = (nowMin / 60) * SLOT_HEIGHT;
                        return (
                          <div
                            className="absolute left-0 right-0 z-20 pointer-events-none"
                            style={{ top: `${top}px` }}
                          >
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-danger-500 -ml-1" />
                              <div className="flex-1 h-px bg-danger-500" />
                            </div>
                          </div>
                        );
                      })()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendamentosPage;
