import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { useDebounce } from '@/hooks/useDebounce';
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
  const [search, setSearch] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data: appointments = [], isLoading } = useAppointments();

  const todayStr = toDateInTz(new Date());

  const getDateStr = (a: Appointment) =>
    a.scheduledDate.length === 10 ? a.scheduledDate : toDateInTz(a.scheduledDate);

  const matchSearch = (a: Appointment) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      (a.patient?.fullName ?? '').toLowerCase().includes(q) ||
      (a.notes ?? '').toLowerCase().includes(q)
    );
  };

  const todayAppts = useMemo(() => appointments
    .filter((a) => getDateStr(a) === todayStr && a.status !== 'completed' && a.status !== 'cancelled')
    .filter(matchSearch)
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()),
    [appointments, debouncedSearch, todayStr]);

  const futureAppts = useMemo(() => appointments
    .filter((a) => getDateStr(a) > todayStr && a.status !== 'completed' && a.status !== 'cancelled')
    .filter(matchSearch)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()),
    [appointments, debouncedSearch, todayStr]);

  const completedAppts = useMemo(() => appointments
    .filter((a) => a.status === 'completed' || a.status === 'cancelled')
    .filter(matchSearch)
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()),
    [appointments, debouncedSearch]);

  return {
    appointments, search, setSearch, isLoading,
    showCompleted, setShowCompleted,
    todayAppts, futureAppts, completedAppts,
    navigateToExecution: (id: string) => navigate(`/consultas/${id}/execucao`),
    navigateToPatient: (id: string) => navigate(`/pacientes/${id}`),
    navigateToNew: () => navigate('/consultas/nova'),
  };
}
