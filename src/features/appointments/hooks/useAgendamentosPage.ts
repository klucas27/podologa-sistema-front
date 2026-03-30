import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments, useUpdateAppointment } from "./useAppointments";
import type { Appointment } from "@/types";
import {
  SLOT_HEIGHT,
  DEFAULT_DURATION_MIN,
  getMonday,
  addDays,
  formatDateISO,
  parseTimeHour,
  pad2,
} from "../constants";
import { getHoursInTz, toISODate, toDateInTz, spDateTimeToISO } from "@/lib/dateUtils";

export function useAgendamentosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const gridRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    appointmentId: string;
    startY: number;
    originalStart: Date;
    originalEnd: Date;
    dayCol: number;
  } | null>(null);

  // React Query: substitui useEffect + api.get + useState
  const { data: appointments = [], isLoading } = useAppointments();
  const updateAppointment = useUpdateAppointment();

  const hourStart = useMemo(
    () => (user?.workdayStart ? parseTimeHour(user.workdayStart) : 8),
    [user?.workdayStart],
  );
  const hourEnd = useMemo(
    () => (user?.workdayEnd ? parseTimeHour(user.workdayEnd) : 18),
    [user?.workdayEnd],
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const hours = useMemo(
    () => Array.from({ length: hourEnd - hourStart }, (_, i) => hourStart + i),
    [hourStart, hourEnd],
  );

  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = 0;
  }, [weekStart]);

  const prevWeek = useCallback(
    () => setWeekStart((ws) => addDays(ws, -7)),
    [],
  );
  const nextWeek = useCallback(
    () => setWeekStart((ws) => addDays(ws, 7)),
    [],
  );
  const goToday = useCallback(() => setWeekStart(getMonday(new Date())), []);

  const appointmentsByDay = useMemo(() => {
    const map: Record<number, Appointment[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];

    // Pré-computa as datas da semana como "YYYY-MM-DD" (local timezone)
    const weekDayStrs = weekDays.map((d) => toISODate(d));

    appointments.forEach((appt) => {
      // scheduledDate vem como "YYYY-MM-DD" do backend (normalizado)
      // Para datetimes, extrai a data no fuso de São Paulo
      const apptDateStr = appt.scheduledDate.length === 10
        ? appt.scheduledDate
        : toDateInTz(appt.scheduledDate);

      for (let i = 0; i < 7; i++) {
        if (apptDateStr === weekDayStrs[i]) {
          map[i]!.push(appt);
          break;
        }
      }
    });
    return map;
  }, [appointments, weekDays]);

  const getApptStyle = useCallback(
    (appt: Appointment): React.CSSProperties => {
      const s = getHoursInTz(appt.scheduledStart);
      const e = getHoursInTz(appt.scheduledEnd);
      const startMin = (s.hours - hourStart) * 60 + s.minutes;
      const endMin = (e.hours - hourStart) * 60 + e.minutes;
      const top = (startMin / 60) * SLOT_HEIGHT;
      const height = Math.max(((endMin - startMin) / 60) * SLOT_HEIGHT, 20);
      return { top: `${top}px`, height: `${height}px` };
    },
    [hourStart],
  );

  const handleSlotClick = useCallback(
    (dayIndex: number, hour: number) => {
      const date = weekDays[dayIndex]!;
      const dateStr = formatDateISO(date);
      const startTime = `${pad2(hour)}:00`;
      const endHour = hour + Math.floor(DEFAULT_DURATION_MIN / 60);
      const endMin = DEFAULT_DURATION_MIN % 60;
      const endTime = `${pad2(endHour)}:${pad2(endMin)}`;
      const candidateUtc = spDateTimeToISO(dateStr, startTime);
      if (new Date(candidateUtc) < new Date()) {
        window.alert("Cannot create appointments in the past.");
        return;
      }
      navigate(
        `/consultas/nova?date=${dateStr}&startTime=${startTime}&endTime=${endTime}`,
      );
    },
    [weekDays, navigate],
  );

  const handleAppointmentClick = useCallback(
    (appt: Appointment, e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/consultas/${appt.id}/execucao`);
    },
    [navigate],
  );

  const handleDragStart = useCallback(
    (appt: Appointment, dayCol: number, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setDragState({
        appointmentId: appt.id,
        startY: e.clientY,
        originalStart: new Date(appt.scheduledStart),
        originalEnd: new Date(appt.scheduledEnd),
        dayCol,
      });
    },
    [],
  );

  useEffect(() => {
    if (!dragState) return;
    const handleMouseMove = (_e: MouseEvent) => {};
    const handleMouseUp = async (e: MouseEvent) => {
      if (!dragState || !gridRef.current) {
        setDragState(null);
        return;
      }
      const deltaY = e.clientY - dragState.startY;
      const deltaMinutes = Math.round(((deltaY / SLOT_HEIGHT) * 60) / 15) * 15;
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
      if (getHoursInTz(newStart).hours < hourStart || getHoursInTz(newEnd).hours > hourEnd) {
        setDragState(null);
        return;
      }
      try {
        await updateAppointment.mutateAsync({
          id: dragState.appointmentId,
          data: {
            scheduledStart: newStart.toISOString(),
            scheduledEnd: newEnd.toISOString(),
          },
        });
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
  }, [dragState, updateAppointment, hourStart, hourEnd]);

  return {
    isLoading,
    weekStart,
    weekDays,
    today,
    hours,
    hourStart,
    hourEnd,
    appointmentsByDay,
    gridRef,
    getApptStyle,
    prevWeek,
    nextWeek,
    goToday,
    handleSlotClick,
    handleAppointmentClick,
    handleDragStart,
    navigate,
  };
}
