import React from 'react';
import { Clock, User, MoreVertical } from 'lucide-react';

export interface AppointmentItem {
  id: string;
  patient: string;
  time: string;
  procedure: string;
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado';
}

const statusConfig: Record<
  AppointmentItem['status'],
  { label: string; className: string }
> = {
  agendado: { label: 'Agendado', className: 'badge-warning' },
  confirmado: { label: 'Confirmado', className: 'badge-primary' },
  em_atendimento: { label: 'Em atendimento', className: 'badge-success' },
  concluido: { label: 'Concluído', className: 'badge bg-gray-100 text-gray-600' },
  cancelado: { label: 'Cancelado', className: 'badge-danger' },
};

interface UpcomingAppointmentsProps {
  appointments: AppointmentItem[];
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ appointments }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Próximos Agendamentos</h2>
        <button type="button" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" aria-label="Mais opções">
          <MoreVertical size={16} />
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-gray-400">Nenhum agendamento para hoje</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {appointments.map((apt) => {
            const status = statusConfig[apt.status];
            return (
              <li
                key={apt.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors"
              >
                {/* Avatar placeholder */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex-shrink-0">
                  <User size={18} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{apt.patient}</p>
                  <p className="text-xs text-gray-400 truncate">{apt.procedure}</p>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                  <Clock size={13} />
                  <span>{apt.time}</span>
                </div>

                {/* Status badge */}
                <span className={`badge flex-shrink-0 ${status.className}`}>
                  {status.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UpcomingAppointments;
