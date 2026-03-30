import React from "react";
import type { Appointment } from "@/types";
import { formatTime, getHoursInTz } from "@/lib/dateUtils";
import {
  SLOT_HEIGHT,
  WEEK_DAYS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatDayNum,
  isSameDay,
  pad2,
} from "../constants";

interface WeekCalendarProps {
  weekDays: Date[];
  today: Date;
  hours: number[];
  hourStart: number;
  hourEnd: number;
  appointmentsByDay: Record<number, Appointment[]>;
  gridRef: React.RefObject<HTMLDivElement | null>;
  getApptStyle: (appt: Appointment) => React.CSSProperties;
  onSlotClick: (dayIndex: number, hour: number) => void;
  onAppointmentClick: (appt: Appointment, e: React.MouseEvent) => void;
  onDragStart: (appt: Appointment, dayCol: number, e: React.MouseEvent) => void;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  weekDays,
  today,
  hours,
  hourStart,
  hourEnd,
  appointmentsByDay,
  gridRef,
  getApptStyle,
  onSlotClick,
  onAppointmentClick,
  onDragStart,
}) => (
  <div className="flex flex-col flex-1 overflow-hidden">
    {/* Day headers */}
    <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200 bg-white flex-shrink-0">
      <div className="border-r border-gray-100" />
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

    {/* Scrollable time grid */}
    <div ref={gridRef} className="flex-1 overflow-y-auto overflow-x-hidden">
      <div
        className="grid grid-cols-[60px_repeat(7,1fr)] relative"
        style={{ minHeight: `${hours.length * SLOT_HEIGHT}px` }}
      >
        {/* Time labels */}
        <div className="border-r border-gray-100">
          {hours.map((h, idx) => (
            <div
              key={h}
              className="relative border-b border-gray-100"
              style={{ height: `${SLOT_HEIGHT}px` }}
            >
              <span
                className={`absolute right-2 text-xs text-gray-400 bg-white px-1 ${
                  idx === 0 ? "top-1" : "-top-2.5"
                }`}
              >
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
              {hours.map((h) => (
                <div
                  key={h}
                  className="border-b border-gray-100 cursor-pointer hover:bg-primary-50/50 transition-colors"
                  style={{ height: `${SLOT_HEIGHT}px` }}
                  onClick={() => onSlotClick(dayIdx, h)}
                />
              ))}

              {dayAppts.map((appt) => {
                const style = getApptStyle(appt);
                const colorClass =
                  STATUS_COLORS[appt.status] ?? STATUS_COLORS["scheduled"];

                return (
                  <div
                    key={appt.id}
                    className={`absolute left-0.5 right-0.5 rounded-md border px-1.5 py-0.5 overflow-hidden cursor-pointer transition-shadow hover:shadow-md z-10 ${colorClass}`}
                    style={style}
                    onClick={(e) => onAppointmentClick(appt, e)}
                    onMouseDown={(e) => onDragStart(appt, dayIdx, e)}
                    title={`${appt.patient?.fullName ?? "Paciente"} · ${STATUS_LABELS[appt.status]}${(appt.patient?._count?.anamneses ?? 0) > 0 ? " · Anamnese preenchida" : ""}`}
                  >
                    <p className="text-xs font-semibold truncate leading-tight">
                      {appt.patient?.fullName ?? "Paciente"}
                      {(appt.patient?._count?.anamneses ?? 0) > 0 && (
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 ml-1 align-middle"
                          title="Anamnese preenchida"
                        />
                      )}
                    </p>
                    {appt.professional?.fullName && (
                      <p className="text-[10px] opacity-75 truncate leading-tight">
                        {appt.professional.fullName}
                      </p>
                    )}
                    <p className="text-[10px] opacity-60">
                      {formatTime(appt.scheduledStart)} –{" "}
                      {formatTime(appt.scheduledEnd)}
                    </p>
                  </div>
                );
              })}

              {/* Current time indicator */}
              {isToday &&
                (() => {
                  const nowSP = getHoursInTz(new Date());
                  const nowMin =
                    (nowSP.hours - hourStart) * 60 + nowSP.minutes;
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
);

export default WeekCalendar;
