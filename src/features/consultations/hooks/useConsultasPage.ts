import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '@/features/appointments/services/appointment.service';
import { toDateInTz } from '@/lib/dateUtils';
import type { Appointment, Anamnesis } from '@/types';

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

export const getActiveConditions = (anamnesis: Anamnesis): string[] => {
  return MEDICAL_HISTORY_LABELS
    .filter(({ key }) => anamnesis[key] === true)
    .map(({ label }) => label);
};

export { formatDate, formatTime } from "@/lib/dateUtils";

export function useConsultasPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await appointmentService.list();
      setAppointments(data);
    } catch {
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const todayStr = toDateInTz(new Date());

  const getDateStr = (a: Appointment) =>
    a.scheduledDate.length === 10 ? a.scheduledDate : toDateInTz(a.scheduledDate);

  const matchSearch = (a: Appointment) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (a.patient?.fullName ?? '').toLowerCase().includes(q) ||
      (a.notes ?? '').toLowerCase().includes(q)
    );
  };

  const todayAppts = appointments
    .filter((a) => getDateStr(a) === todayStr && a.status !== 'completed' && a.status !== 'cancelled')
    .filter(matchSearch)
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());

  const futureAppts = appointments
    .filter((a) => getDateStr(a) > todayStr && a.status !== 'completed' && a.status !== 'cancelled')
    .filter(matchSearch)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  const completedAppts = appointments
    .filter((a) => a.status === 'completed' || a.status === 'cancelled')
    .filter(matchSearch)
    .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));

  return {
    appointments, search, setSearch, isLoading,
    showCompleted, setShowCompleted,
    todayAppts, futureAppts, completedAppts,
    navigateToExecution: (id: string) => navigate(`/consultas/${id}/execucao`),
    navigateToPatient: (id: string) => navigate(`/pacientes/${id}`),
    navigateToNew: () => navigate('/consultas/nova'),
  };
}
