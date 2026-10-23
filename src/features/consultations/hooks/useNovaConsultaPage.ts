import { isProfessionalRole } from '@/config/permissions';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePatients } from '@/features/patients/hooks/usePatients';
import { useActiveProfessionals } from '@/features/professionals/hooks/useProfessionals';
import { useCreateAppointment } from '@/features/appointments/hooks/useAppointments';
import { useProfessionalServices } from '@/features/services/hooks/useServices';
import { spDateTimeToISO } from '@/lib/dateUtils';
import type { AppointmentSource, Patient } from '@/types';

export const SOURCE_OPTIONS: { value: AppointmentSource; label: string }[] = [
  { value: 'balcao', label: 'Balcão / telefone' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'indicacao', label: 'Indicação' },
];

const addMinutes = (hhmm: string, minutes: number): string => {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const toDisplayDate = (iso: string): string => {
  if (!iso) return '';
  const d = iso.slice(0, 10).split('-');
  return `${d[2]}/${d[1]}/${d[0]}`;
};

const fromDisplayDate = (ddmmyy: string): string => {
  const parts = ddmmyy.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

const applyDateMask = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export const formatPhone = (phone: string | null): string => {
  if (!phone) return '';
  const d = phone.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
};

export function useNovaConsultaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const preselectedPatientId = searchParams.get('patientId') ?? '';
  const preselectedDate = searchParams.get('date') ?? '';
  const preselectedStart = searchParams.get('startTime') ?? '';
  const preselectedProfessional = searchParams.get('professionalId') ?? '';

  // Debounced search for patient autocomplete
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [chosenProfessionalId, setProfessionalId] = useState(preselectedProfessional);
  const professionalId = user?.professionalId && isProfessionalRole(user.role) ? user.professionalId : chosenProfessionalId;
  const [chosenServiceId, setServiceId] = useState('');
  const [source, setSource] = useState<AppointmentSource>('balcao');
  const [patientId, setPatientId] = useState(preselectedPatientId);
  const [selectedPatientName, setSelectedPatientName] = useState('');

  const [scheduledDate, setScheduledDate] = useState(() => toDisplayDate(preselectedDate));
  const [scheduledStart, setScheduledStart] = useState(preselectedStart);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // React Query: patients (debounced autocomplete search)
  const { data: patients = [], isLoading: isLoadingPatients } = usePatients(debouncedQuery || undefined);

  // React Query: active professionals
  const { data: professionals = [], isLoading: isLoadingProfessionals } = useActiveProfessionals();

  // Serviços que a profissional escolhida realiza (duração e preço vêm daqui)
  const { data: services = [], isLoading: isLoadingServices } = useProfessionalServices(professionalId || null);
  const activeServices = services.filter((sv) => sv.isActive);
  const serviceId = activeServices.some((sv) => sv.id === chosenServiceId) ? chosenServiceId : '';
  const selectedService = activeServices.find((sv) => sv.id === serviceId) ?? null;
  const scheduledEnd = selectedService && scheduledStart ? addMinutes(scheduledStart, selectedService.durationMinutes) : '';

  // React Query: create mutation
  const createMutation = useCreateAppointment();
  const isSaving = createMutation.isPending;

  // Debounce the patient query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Pre-select patient name from URL param
  useEffect(() => {
    if (preselectedPatientId && patients.length > 0 && !selectedPatientName) {
      const found = patients.find((p) => p.id === preselectedPatientId);
      if (found) setSelectedPatientName(found.fullName);
    }
  }, [patients, preselectedPatientId, selectedPatientName]);

  // Click-outside to close autocomplete
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectPatient = (p: Patient) => {
    setPatientId(p.id);
    setSelectedPatientName(p.fullName);
    setQuery('');
    setShowResults(false);
  };

  const clearPatient = () => {
    setPatientId('');
    setSelectedPatientName('');
    setQuery('');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScheduledDate(applyDateMask(e.target.value));
  };

  const buildDateTime = (displayDate: string, time: string): string => {
    if (!displayDate || !time) return '';
    const isoDate = fromDisplayDate(displayDate);
    return spDateTimeToISO(isoDate, time);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientId) { setError('Selecione a cliente.'); return; }
    if (!professionalId) { setError('Selecione a profissional.'); return; }
    if (!selectedService) { setError('Selecione o serviço.'); return; }
    if (!scheduledDate || !scheduledStart) { setError('Preencha a data e o horário de início.'); return; }

    const isoDate = fromDisplayDate(scheduledDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      setError('A data deve estar no formato DD/MM/AAAA.'); return;
    }

    const start = buildDateTime(scheduledDate, scheduledStart);
    if (new Date(start) < new Date()) {
      setError('Não é possível agendar no passado.'); return;
    }

    createMutation.mutate(
      {
        patientId,
        professionalId,
        serviceId: selectedService.id,
        scheduledStart: start,
        source,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => navigate('/agendamentos'),
        onError: (err) => {
          const message = (err as { message?: string })?.message || 'Erro ao criar agendamento.';
          setError(message);
        },
      },
    );
  };

  const isProfessionalUser = isProfessionalRole(user?.role) && !!user?.professionalId;

  return {
    patients, isLoadingPatients,
    professionals, isLoadingProfessionals, professionalId, setProfessionalId,
    isProfessionalUser,
    patientId, selectedPatientName,
    activeServices, isLoadingServices, serviceId, setServiceId, selectedService,
    source, setSource,
    scheduledDate, scheduledStart, scheduledEnd, notes,
    isSaving, error,
    query, setQuery, showResults, setShowResults, wrapperRef,
    selectPatient, clearPatient,
    handleDateChange, setScheduledStart, setNotes,
    handleSubmit,
    goBack: () => navigate(-1),
  };
}
