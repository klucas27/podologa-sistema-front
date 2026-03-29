import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { useDebounce } from '@/hooks/useDebounce';
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

export const formatDate = (iso: string) => {
  const parts = iso.slice(0, 10).split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const toDateStr = (iso: string) => iso.slice(0, 10);

export function useConsultasPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data: appointments = [], isLoading } = useAppointments();

  const todayStr = new Date().toISOString().slice(0, 10);

  const matchSearch = (a: Appointment) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      (a.patient?.fullName ?? '').toLowerCase().includes(q) ||
      (a.notes ?? '').toLowerCase().includes(q)
    );
  };

  // useMemo: estas 3 filtragens+sorts percorrem O(n) cada. Com 200+
  // consultas, re-calcular em cada render (sidebar collapse, etc.)
  // desperdiça ~5ms. Memoizando, só recalcula quando appointments ou search mudam.
  const todayAppts = useMemo(() => appointments
    .filter((a) => toDateStr(a.scheduledDate) === todayStr && a.status !== 'completed' && a.status !== 'cancelled')
    .filter(matchSearch)
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()),
    [appointments, debouncedSearch, todayStr]);

  const futureAppts = useMemo(() => appointments
    .filter((a) => toDateStr(a.scheduledDate) > todayStr && a.status !== 'completed' && a.status !== 'cancelled')
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
