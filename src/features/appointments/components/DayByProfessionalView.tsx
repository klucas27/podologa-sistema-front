import React from 'react';
import type { Appointment, ServiceCategory } from '@/types';
import { formatTime, getHoursInTz } from '@/lib/dateUtils';
import { NO_SHOW_BUTTON, SLOT_HEIGHT, STATUS_COLORS, STATUS_LABELS, isNoShowCandidate, pad2 } from '../constants';

export interface ProfessionalColumn {
  id: string;
  name: string;
}

interface Props {
  isToday: boolean;
  columns: ProfessionalColumn[];
  appointments: Appointment[];
  hours: number[];
  hourStart: number;
  hourEnd: number;
  categoryOf: (serviceId: string | null) => ServiceCategory | null;
  serviceNameOf: (serviceId: string | null) => string | null;
  getApptStyle: (appt: Appointment) => React.CSSProperties;
  onSlotClick: (professionalId: string, hour: number) => void;
  onAppointmentClick: (appt: Appointment, e: React.MouseEvent) => void;
  /** Só admin/recepção recebem: botão "Falta" nos atendimentos já iniciados sem registro. */
  onMarkNoShow?: (appt: Appointment) => void;
}

const CATEGORY_BAR: Record<ServiceCategory, string> = {
  estetica: 'border-l-4 border-l-primary-300',
  podologia: 'border-l-4 border-l-primary-700',
};

/** Agenda do dia com uma coluna por profissional (atendimentos simultâneos lado a lado). */
const DayByProfessionalView: React.FC<Props> = ({
  isToday, columns, appointments, hours, hourStart, hourEnd,
  categoryOf, serviceNameOf, getApptStyle, onSlotClick, onAppointmentClick, onMarkNoShow,
}) => {
  if (columns.length === 0) {
    return <p className="p-8 text-center text-sm text-gray-500">Nenhuma profissional ativa para exibir.</p>;
  }

  const nowLine = (() => {
    if (!isToday) return null;
    const now = getHoursInTz(new Date());
    const min = (now.hours - hourStart) * 60 + now.minutes;
    if (min < 0 || min > (hourEnd - hourStart) * 60) return null;
    return (min / 60) * SLOT_HEIGHT;
  })();

  return (
    <div className="flex-1 overflow-auto bg-white" data-testid="day-by-professional">
      <div
        className="grid relative"
        style={{ gridTemplateColumns: `60px repeat(${columns.length}, minmax(10rem, 1fr))`, minWidth: `${60 + columns.length * 160}px` }}
      >
        {/* Cabeçalho fixo */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200" />
        {columns.map((c) => (
          <div key={c.id} className="sticky top-0 z-30 bg-white border-b border-l border-gray-200 px-2 py-2 text-center">
            <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
          </div>
        ))}

        {/* Horas */}
        <div className="border-r border-gray-100">
          {hours.map((h) => (
            <div key={h} className="relative border-b border-gray-100" style={{ height: `${SLOT_HEIGHT}px` }}>
              <span className="absolute right-2 top-1 text-xs text-gray-400">{pad2(h)}:00</span>
            </div>
          ))}
        </div>

        {columns.map((c) => (
          <div key={c.id} className="relative border-l border-gray-100" data-professional={c.id}>
            {hours.map((h) => (
              <button
                key={h}
                type="button"
                aria-label={`Agendar com ${c.name} às ${pad2(h)}:00`}
                className="block w-full border-b border-gray-100 hover:bg-primary-50/60 focus:bg-primary-50 focus:outline-none"
                style={{ height: `${SLOT_HEIGHT}px` }}
                onClick={() => onSlotClick(c.id, h)}
              />
            ))}

            {appointments.filter((a) => a.professionalId === c.id).map((appt) => {
              const category = categoryOf(appt.serviceId);
              const serviceName = serviceNameOf(appt.serviceId);
              const name = appt.patient?.fullName ?? 'Cliente';
              return (
                <div key={appt.id} className="absolute left-1 right-1 z-10" style={getApptStyle(appt)}>
                  <button
                    type="button"
                    className={`h-full w-full rounded-md border px-2 py-1 text-left overflow-hidden hover:shadow-md ${STATUS_COLORS[appt.status]} ${category ? CATEGORY_BAR[category] : ''}`}
                    onClick={(e) => onAppointmentClick(appt, e)}
                    title={`${appt.patient?.fullName ?? 'Cliente'} · ${STATUS_LABELS[appt.status]}`}
                  >
                    <p className="text-xs font-semibold truncate leading-tight">{appt.patient?.fullName ?? 'Cliente'}</p>
                    {serviceName && <p className="text-[11px] truncate leading-tight opacity-80">{serviceName}</p>}
                    <p className="text-[11px] opacity-70">
                      {formatTime(appt.scheduledStart)}–{formatTime(appt.scheduledEnd)}
                      {appt.status === 'pending' && ' · aguardando confirmação'}
                    </p>
                  </button>
                  {onMarkNoShow && isNoShowCandidate(appt) && (
                    <button type="button" className={NO_SHOW_BUTTON} aria-label={`Marcar falta de ${name}`} onClick={() => onMarkNoShow(appt)}>
                      Falta
                    </button>
                  )}
                </div>
              );
            })}

            {nowLine !== null && (
              <div className="absolute left-0 right-0 z-20 h-px bg-danger-500 pointer-events-none" style={{ top: `${nowLine}px` }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayByProfessionalView;
