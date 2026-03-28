import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  CalendarDays,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAgendamentosPage } from "../hooks/useAgendamentosPage";
import WeekCalendar from "../components/WeekCalendar";
import { formatMonthYear } from "../constants";

const AgendamentosPageInner: React.FC = () => {
  const state = useAgendamentosPage();

  const weekEndDate = state.weekDays[6]!;
  const headerLabel =
    formatMonthYear(state.weekStart) === formatMonthYear(weekEndDate)
      ? formatMonthYear(state.weekStart)
      : `${state.weekStart.toLocaleDateString("pt-BR", { month: "short" })} – ${weekEndDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`;

  return (
    <div className="flex flex-col h-full -m-4 md:-m-6">
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
            type="button"
            onClick={state.prevWeek}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            title="Semana anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={state.goToday}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={state.nextWeek}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            title="Próxima semana"
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
        <div className="flex items-center justify-center flex-1 p-12">
          <Loader2 size={24} className="animate-spin text-primary-500" />
        </div>
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
