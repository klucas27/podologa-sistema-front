import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAgendamentosPage } from "../hooks/useAgendamentosPage";
import { useMarkNoShow } from "../hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import type { Appointment } from "@/types";
import WeekCalendar from "../components/WeekCalendar";
import DayByProfessionalView from "../components/DayByProfessionalView";
import { formatMonthYear, STATUS_COLORS, STATUS_LABELS } from "../constants";
import { formatShortMonthYear, formatLongDate, toISODate } from "@/lib/dateUtils";

const AgendamentosPageInner: React.FC = () => {
  const state = useAgendamentosPage();
  const { role } = useAuth();
  const markNoShow = useMarkNoShow();
  // Falta é registrada só por admin/recepção (o back também barra as profissionais)
  const onMarkNoShow = role === "admin" || role === "recepcao"
    ? (appt: Appointment) => {
      if (window.confirm(`Marcar falta de ${appt.patient?.fullName ?? "cliente"}?`)) markNoShow.mutate(appt.id);
    }
    : undefined;

  const weekEndDate = state.weekDays[6]!;
  const isDay = state.viewMode === "day";
  const weekLabel =
    formatMonthYear(state.weekStart) === formatMonthYear(weekEndDate)
      ? formatMonthYear(state.weekStart)
      : `${formatShortMonthYear(state.weekStart)} – ${formatShortMonthYear(weekEndDate)}`;
  const headerLabel = isDay ? formatLongDate(toISODate(state.day)) : weekLabel;
  const isTodaySelected = toISODate(state.day) === toISODate(state.today);

  return (
    <div className="flex flex-col h-full -m-4 md:-m-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 md:px-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <CalendarDays size={22} className="text-primary-500" />
          <div>
            <h1 className={`text-xl font-bold text-gray-800 ${isDay ? "first-letter:uppercase" : "capitalize"}`}>
              {headerLabel}
            </h1>
            <p className="text-xs text-gray-400">
              {isDay ? "Agenda do dia por profissional" : "Agenda da semana"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 p-0.5" role="group" aria-label="Visualização">
            {(["day", "week"] as const).map((m) => (
              <button key={m} type="button" aria-pressed={state.viewMode === m} onClick={() => state.setViewMode(m)}
                className={`min-h-10 px-3 rounded-md text-sm font-medium ${state.viewMode === m ? "bg-primary-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                {m === "day" ? "Dia" : "Semana"}
              </button>
            ))}
          </div>
          {isDay && !state.isProfessionalUser && (
            <select aria-label="Filtrar profissional" value={state.professionalFilter} onChange={(e) => state.setProfessionalFilter(e.target.value)}
              className="min-h-10 px-2 rounded-lg border border-gray-200 text-sm bg-white">
              <option value="">Todas as profissionais</option>
              {state.professionals.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          )}
          <button
            type="button"
            onClick={isDay ? state.prevDay : state.prevWeek}
            className="p-3 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            title={isDay ? "Dia anterior" : "Semana anterior"}
            aria-label={isDay ? "Dia anterior" : "Semana anterior"}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={state.goToday}
            className="min-h-10 px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={isDay ? state.nextDay : state.nextWeek}
            className="p-3 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            title={isDay ? "Próximo dia" : "Próxima semana"}
            aria-label={isDay ? "Próximo dia" : "Próxima semana"}
          >
            <ChevronRight size={18} />
          </button>
          <Button
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => state.navigate("/consultas/nova")}
          >
            Novo
          </Button>
        </div>
      </div>

      {state.isLoading ? (
        <div className="flex-1 p-6 space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-8 rounded" />
            ))}
          </div>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, j) => (
                <Skeleton key={j} className="h-12 rounded" />
              ))}
            </div>
          ))}
        </div>
      ) : isDay ? (
        <>
          <div className="flex flex-wrap gap-2 px-4 py-2 md:px-6 bg-white border-b border-gray-100 text-xs" aria-label="Legenda">
            {(["pending", "scheduled", "confirmed", "in_progress", "completed", "no_show"] as const).map((st) => (
              <span key={st} className={`rounded border px-2 py-0.5 ${STATUS_COLORS[st]}`}>{STATUS_LABELS[st]}</span>
            ))}
            <span className="rounded border-l-4 border-l-primary-300 border border-gray-200 px-2 py-0.5">Estética</span>
            <span className="rounded border-l-4 border-l-primary-700 border border-gray-200 px-2 py-0.5">Podologia</span>
          </div>
          <DayByProfessionalView
            isToday={isTodaySelected}
            columns={state.columns}
            appointments={state.dayAppointments}
            hours={state.hours}
            hourStart={state.hourStart}
            hourEnd={state.hourEnd}
            categoryOf={state.categoryOf}
            serviceNameOf={state.serviceNameOf}
            getApptStyle={state.getApptStyle}
            onSlotClick={state.handleDaySlotClick}
            onAppointmentClick={state.handleAppointmentClick}
            onMarkNoShow={onMarkNoShow}
          />
        </>
      ) : (
        <WeekCalendar
          weekDays={state.weekDays}
          today={state.today}
          hours={state.hours}
          hourStart={state.hourStart}
          hourEnd={state.hourEnd}
          appointmentsByDay={state.appointmentsByDay}
          gridRef={state.gridRef}
          getApptStyle={state.getApptStyle}
          onSlotClick={state.handleSlotClick}
          onAppointmentClick={state.handleAppointmentClick}
          onDragStart={state.handleDragStart}
          onMarkNoShow={onMarkNoShow}
        />
      )}
    </div>
  );
};

const AgendamentosPage: React.FC = () => (
  <ErrorBoundary featureName="Agendamentos">
    <AgendamentosPageInner />
  </ErrorBoundary>
);

export default AgendamentosPage;
