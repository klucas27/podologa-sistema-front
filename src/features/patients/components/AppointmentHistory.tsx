import React from "react";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  FileText,
  Pill,
  Home,
  RotateCcw,
  Bug,
} from "lucide-react";
import type { Appointment } from "@/types";
import { STATUS_LABELS, BODY_PART_LABELS, formatDate, formatTime } from "../constants";

interface AppointmentHistoryProps {
  appointments: Appointment[];
  expandedAppointment: string | null;
  onToggle: (id: string) => void;
}

const AppointmentHistory: React.FC<AppointmentHistoryProps> = ({
  appointments,
  expandedAppointment,
  onToggle,
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Stethoscope size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-gray-800">
          Histórico de Consultas
        </h2>
      </div>
      <span className="text-xs text-gray-400">
        {appointments.length} consulta{appointments.length !== 1 ? "s" : ""}
      </span>
    </div>

    {appointments.length === 0 ? (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-400 text-sm">
          Nenhuma consulta registrada.
        </p>
      </div>
    ) : (
      <div className="space-y-3">
        {appointments.map((appt) => (
          <AppointmentItem
            key={appt.id}
            appointment={appt}
            isOpen={expandedAppointment === appt.id}
            onToggle={() => onToggle(appt.id)}
          />
        ))}
      </div>
    )}
  </div>
);

const AppointmentItem: React.FC<{
  appointment: Appointment;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ appointment: appt, isOpen, onToggle }) => {
  const status = STATUS_LABELS[appt.status] ?? STATUS_LABELS["scheduled"];
  const evolutions = appt.clinicalEvolutions ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Clock size={16} className="text-gray-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-700">
              {formatDate(appt.scheduledDate)} ·{" "}
              {formatTime(appt.scheduledStart)} -{" "}
              {formatTime(appt.scheduledEnd)}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status?.className}`}
              >
                {status?.label}
              </span>
              {(appt.professional?.fullName ||
                appt.user?.professionalName) && (
                <span className="text-xs text-gray-400">
                  {appt.professional?.fullName || appt.user?.professionalName}
                </span>
              )}
            </div>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
          {appt.notes && (
            <div>
              <span className="text-xs text-gray-400">
                Observações do agendamento
              </span>
              <p className="text-sm text-gray-700 mt-1">{appt.notes}</p>
            </div>
          )}

          {evolutions.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Nenhuma evolução clínica registrada.
            </p>
          ) : (
            evolutions.map((evo) => (
              <EvolutionDetail key={evo.id} evolution={evo} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const EvolutionDetail: React.FC<{
  evolution: NonNullable<Appointment["clinicalEvolutions"]>[number];
}> = ({ evolution: evo }) => (
  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
    <p className="text-xs text-gray-400">
      Evolução — {formatDate(evo.createdAt)}
    </p>

    {evo.clinicalNotes && (
      <div className="flex items-start gap-2">
        <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-xs text-gray-400">Notas clínicas</span>
          <p className="text-sm text-gray-700">{evo.clinicalNotes}</p>
        </div>
      </div>
    )}

    {evo.prescribedMedications && (
      <div className="flex items-start gap-2">
        <Pill size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-xs text-gray-400">Medicamentos prescritos</span>
          <p className="text-sm text-gray-700">{evo.prescribedMedications}</p>
        </div>
      </div>
    )}

    {evo.homeCareRecommendations && (
      <div className="flex items-start gap-2">
        <Home size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-xs text-gray-400">Cuidados domiciliares</span>
          <p className="text-sm text-gray-700">
            {evo.homeCareRecommendations}
          </p>
        </div>
      </div>
    )}

    {evo.recommendedReturnDays !== null &&
      evo.recommendedReturnDays !== undefined && (
        <div className="flex items-start gap-2">
          <RotateCcw
            size={14}
            className="text-gray-400 mt-0.5 flex-shrink-0"
          />
          <div>
            <span className="text-xs text-gray-400">Retorno recomendado</span>
            <p className="text-sm text-gray-700">
              {evo.recommendedReturnDays} dias
            </p>
          </div>
        </div>
      )}

    {evo.evolutionPathologies && evo.evolutionPathologies.length > 0 && (
      <div>
        <div className="flex items-center gap-1 mb-2">
          <Bug size={14} className="text-orange-500" />
          <span className="text-xs font-medium text-gray-600">
            Patologias
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {evo.evolutionPathologies.map((ep) => (
            <span
              key={`${ep.pathologyId}-${ep.bodyPart}`}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700"
              title={ep.notes ?? undefined}
            >
              {ep.pathology?.name ?? ep.pathologyId} –{" "}
              {BODY_PART_LABELS[ep.bodyPart]}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default AppointmentHistory;
