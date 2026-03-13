import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Clock,
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Stethoscope,
  Eye,
  UserCog,
  ClipboardCheck,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import type { Appointment, AppointmentStatus, Anamnesis } from '@/types';

const MEDICAL_HISTORY_LABELS: { key: keyof Anamnesis; label: string }[] = [
  { key: 'hasHypertension', label: 'Hipertensão' },
  { key: 'hasDiabetes', label: 'Diabetes' },
  { key: 'hasCirculatoryProblems', label: 'Prob. Circulatórios' },
  { key: 'hasHealingProblems', label: 'Prob. Cicatrização' },
  { key: 'hasCancerHistory', label: 'Câncer' },
  { key: 'hasSeizures', label: 'Convulsões' },
  { key: 'hasPacemakerOrPins', label: 'Marca-passo/Pinos' },
  { key: 'isPregnant', label: 'Gestante' },
  { key: 'hasLowerLimbSurgery', label: 'Cirurgia MI' },
];

const getActiveConditions = (anamnesis: Anamnesis): string[] => {
  return MEDICAL_HISTORY_LABELS
    .filter(({ key }) => anamnesis[key] === true)
    .map(({ label }) => label);
};

const STATUS_LABELS: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-blue-50 text-blue-700' },
  confirmed: { label: 'Confirmada', className: 'bg-cyan-50 text-cyan-700' },
  in_progress: { label: 'Em andamento', className: 'bg-yellow-50 text-yellow-700' },
  cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-700' },
  completed: { label: 'Concluída', className: 'bg-green-50 text-green-700' },
};

const formatDate = (iso: string) => {
  const parts = iso.slice(0, 10).split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const toDateStr = (iso: string) => iso.slice(0, 10);

const ConsultasPage: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ data: Appointment[] }>('/api/appointments');
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

  const todayStr = new Date().toISOString().slice(0, 10);

  const matchSearch = (a: Appointment) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (a.patient?.fullName ?? '').toLowerCase().includes(q) ||
      (a.notes ?? '').toLowerCase().includes(q)
    );
  };

  const todayAppts = appointments
    .filter((a) => toDateStr(a.scheduledDate) === todayStr && a.status !== 'completed' && a.status !== 'cancelled')
    .filter(matchSearch)
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());

  const futureAppts = appointments
    .filter((a) => toDateStr(a.scheduledDate) > todayStr && a.status !== 'completed' && a.status !== 'cancelled')
    .filter(matchSearch)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const completedAppts = appointments
    .filter((a) => a.status === 'completed' || a.status === 'cancelled')
    .filter(matchSearch)
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  const renderAppointmentCard = (appt: Appointment) => {
    const status = STATUS_LABELS[appt.status] ?? STATUS_LABELS['scheduled'];
    return (
      <li
        key={appt.id}
        onClick={() => navigate(`/consultas/${appt.id}/execucao`)}
        className="group flex items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 hover:bg-gray-50 transition cursor-pointer"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex-shrink-0">
          {appt.patient?.fullName
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() ?? '??'}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {appt.patient?.fullName ?? 'Paciente'}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              {formatDate(appt.scheduledDate)} · {formatTime(appt.scheduledStart)} - {formatTime(appt.scheduledEnd)}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
            {appt.professional?.fullName && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <UserCog size={12} />
                {appt.professional.fullName}
              </span>
            )}
            {(appt.patient?._count?.anamneses ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <ClipboardCheck size={10} />
                Anamnese
              </span>
            )}
          </div>
          {/* Medical history conditions */}
          {appt.patient?.anamneses && appt.patient.anamneses.length > 0 && (() => {
            const conditions = getActiveConditions(appt.patient.anamneses[0]!);
            return conditions.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {conditions.map((cond) => (
                  <span
                    key={cond}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            ) : null;
          })()}
          {appt.notes && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{appt.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {appt.patient && (
            <button
              type="button"
              onClick={() => navigate(`/pacientes/${appt.patientId}`)}
              className="p-2 rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition"
              title="Ver prontuário"
            >
              <Eye size={16} />
            </button>
          )}
        </div>
      </li>
    );
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    items: Appointment[],
    emptyText: string,
  ) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold text-gray-700">{title}</h2>
        <span className="text-xs text-gray-400">({items.length})</span>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-400 text-sm">{emptyText}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map(renderAppointmentCard)}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Consultas</h1>
          <p className="text-sm text-gray-500">
            {appointments.length} consulta{appointments.length !== 1 ? 's' : ''} no total
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => navigate('/consultas/nova')}>
          Nova Consulta
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome do paciente ou observações..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 size={24} className="animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {renderSection(
            'Hoje',
            <Stethoscope size={18} className="text-primary-500" />,
            todayAppts,
            'Nenhuma consulta para hoje.',
          )}

          {renderSection(
            'Futuras',
            <CalendarClock size={18} className="text-blue-500" />,
            futureAppts,
            'Nenhuma consulta futura agendada.',
          )}

          {/* Completed section — toggle */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowCompleted((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
            >
              <CalendarCheck size={18} className="text-green-500" />
              <span>Concluídas / Canceladas ({completedAppts.length})</span>
              {showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showCompleted && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {completedAppts.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-400 text-sm">Nenhuma consulta concluída ou cancelada.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {completedAppts.map(renderAppointmentCard)}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ConsultasPage;
