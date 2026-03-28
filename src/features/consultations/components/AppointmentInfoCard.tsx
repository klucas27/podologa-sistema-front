import React from "react";
import { Clock, PlayCircle, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { STATUS_LABELS, formatDate, formatTime } from "../constants";
import type { Appointment, AppointmentStatus } from "@/types";

interface AppointmentInfoCardProps {
  appointment: Appointment;
  isEditable: boolean;
  isUpdatingStatus: boolean;
  isSaving: boolean;
  editStart: string;
  editEnd: string;
  onEditStartChange: (v: string) => void;
  onEditEndChange: (v: string) => void;
  onUpdateStatus: (s: AppointmentStatus) => void;
  onSaveTimes: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onNavigate: (path: string) => void;
}

const AppointmentInfoCard: React.FC<AppointmentInfoCardProps> = ({
  appointment,
  isEditable,
  isUpdatingStatus,
  isSaving,
  editStart,
  editEnd,
  onEditStartChange,
  onEditEndChange,
  onUpdateStatus,
  onSaveTimes,
  onCancel,
  onDelete,
  onNavigate,
}) => {
  const status =
    STATUS_LABELS[appointment.status] ?? STATUS_LABELS["scheduled"];

  return (
    <section
      aria-labelledby="appointment-info-heading"
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      <h2 id="appointment-info-heading" className="sr-only">
        Informações da consulta
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex-shrink-0">
              {appointment.patient?.fullName
                ? appointment.patient.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "?"}
            </div>

            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-800 truncate">
                {appointment.patient?.fullName ?? "Paciente sem nome"}
              </p>
              <p className="text-sm text-gray-500 mt-1 truncate">
                {appointment.patient?.phoneNumber ?? "Contato não informado"}
              </p>

              <dl className="mt-3 grid grid-cols-1 gap-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <div>
                      <time
                        dateTime={(appointment.scheduledDate ?? "").slice(
                          0,
                          10,
                        )}
                      >
                        {formatDate(appointment.scheduledDate)}
                      </time>
                    </div>
                    <div className="text-sm text-gray-500">
                      <time dateTime={appointment.scheduledStart ?? ""}>
                        {formatTime(appointment.scheduledStart)}
                      </time>
                      {" — "}
                      <time dateTime={appointment.scheduledEnd ?? ""}>
                        {formatTime(appointment.scheduledEnd)}
                      </time>
                    </div>
                  </div>
                </div>

                {(appointment.actualStartTime || appointment.actualEndTime) && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-xs font-medium text-gray-700">
                      Real:
                    </span>
                    <div className="text-sm">
                      {appointment.actualStartTime ? (
                        <time dateTime={appointment.actualStartTime}>
                          {formatDate(appointment.actualStartTime)}{" "}
                          {formatTime(appointment.actualStartTime)}
                        </time>
                      ) : (
                        <span>—</span>
                      )}
                      {appointment.actualEndTime &&
                      appointment.actualEndTime !==
                        appointment.actualStartTime ? (
                        <span>
                          {" "}
                          —{" "}
                          <time dateTime={appointment.actualEndTime}>
                            {formatDate(appointment.actualEndTime)}{" "}
                            {formatTime(appointment.actualEndTime)}
                          </time>
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span
              role="status"
              aria-label={`Status: ${status.label}`}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
            >
              {status.label}
            </span>
            {(appointment.professional?.fullName ||
              appointment.user?.professionalName) && (
              <div className="text-sm text-gray-500">
                {appointment.professional?.fullName ||
                  appointment.user?.professionalName}
              </div>
            )}
          </div>

          {appointment.notes && (
            <p className="mt-3 text-sm text-gray-600 italic">
              {appointment.notes}
            </p>
          )}
        </div>

        <AppointmentActions
          appointment={appointment}
          isEditable={isEditable}
          isUpdatingStatus={isUpdatingStatus}
          isSaving={isSaving}
          editStart={editStart}
          editEnd={editEnd}
          onEditStartChange={onEditStartChange}
          onEditEndChange={onEditEndChange}
          onUpdateStatus={onUpdateStatus}
          onSaveTimes={onSaveTimes}
          onCancel={onCancel}
          onDelete={onDelete}
          onNavigate={onNavigate}
        />
      </div>
    </section>
  );
};

const AppointmentActions: React.FC<
  Pick<
    AppointmentInfoCardProps,
    | "appointment"
    | "isEditable"
    | "isUpdatingStatus"
    | "isSaving"
    | "editStart"
    | "editEnd"
    | "onEditStartChange"
    | "onEditEndChange"
    | "onUpdateStatus"
    | "onSaveTimes"
    | "onCancel"
    | "onDelete"
    | "onNavigate"
  >
> = ({
  appointment,
  isEditable,
  isUpdatingStatus,
  isSaving,
  editStart,
  editEnd,
  onEditStartChange,
  onEditEndChange,
  onUpdateStatus,
  onSaveTimes,
  onCancel,
  onDelete,
  onNavigate,
}) => (
  <div className="flex-shrink-0 w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-3">
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center">
      {(appointment.status === "scheduled" ||
        appointment.status === "confirmed") && (
        <div className="w-full sm:w-auto">
          <Button
            size="sm"
            icon={<PlayCircle size={14} />}
            onClick={() => onUpdateStatus("in_progress")}
            isLoading={isUpdatingStatus}
            type="button"
            className="w-full sm:w-auto"
          >
            Iniciar
          </Button>
        </div>
      )}
      {appointment.status === "in_progress" && (
        <div className="w-full sm:w-auto">
          <Button
            size="sm"
            variant="secondary"
            icon={<CheckCircle size={14} />}
            onClick={() => onUpdateStatus("completed")}
            isLoading={isUpdatingStatus}
            type="button"
            className="w-full sm:w-auto"
          >
            Finalizar
          </Button>
        </div>
      )}
      {appointment.patient && (
        <div className="w-full sm:w-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate(`/pacientes/${appointment.patientId}`)}
            type="button"
            className="w-full sm:w-auto"
          >
            Prontuário
          </Button>
        </div>
      )}
    </div>

    <div className="mt-2 w-full bg-gray-50 p-3 rounded-lg">
      {isEditable ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600" htmlFor="editStart">
              Início
            </label>
            <input
              id="editStart"
              aria-label="Horário de início"
              type="time"
              value={editStart}
              onChange={(e) => onEditStartChange(e.target.value)}
              className="w-full sm:w-28 px-2 py-1 rounded-lg border border-gray-300 text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600" htmlFor="editEnd">
              Fim
            </label>
            <input
              id="editEnd"
              aria-label="Horário de término"
              type="time"
              value={editEnd}
              onChange={(e) => onEditEndChange(e.target.value)}
              className="w-full sm:w-28 px-2 py-1 rounded-lg border border-gray-300 text-sm outline-none"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Button
              size="sm"
              type="button"
              onClick={onSaveTimes}
              isLoading={isSaving}
              className="w-full sm:w-auto"
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Horários não editáveis</div>
      )}

      {(appointment.status === "scheduled" ||
        appointment.status === "confirmed") && (
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <div className="w-full sm:w-auto">
            <Button
              size="sm"
              variant="secondary"
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          </div>
          <div className="w-full sm:w-auto">
            <Button
              size="sm"
              variant="danger"
              type="button"
              onClick={onDelete}
              className="w-full sm:w-auto"
            >
              Excluir
            </Button>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default AppointmentInfoCard;
