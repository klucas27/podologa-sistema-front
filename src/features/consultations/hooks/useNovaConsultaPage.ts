import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { patientService } from '@/features/patients/services/patient.service';
import { professionalService } from '@/features/professionals/services/professional.service';
import { appointmentService } from '@/features/appointments/services/appointment.service';
import type { Patient, Professional } from '@/types';

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
  const preselectedEnd = searchParams.get('endTime') ?? '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(true);
  const [professionalId, setProfessionalId] = useState('');

  const [patientId, setPatientId] = useState(preselectedPatientId);
  const [selectedPatientName, setSelectedPatientName] = useState('');

  const [scheduledDate, setScheduledDate] = useState(() => toDisplayDate(preselectedDate));
  const [scheduledStart, setScheduledStart] = useState(preselectedStart);
  const [scheduledEnd, setScheduledEnd] = useState(preselectedEnd);
  const [notes, setNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const fetchPatients = useCallback(async (q?: string) => {
    setIsLoadingPatients(true);
    try {
      const data = await patientService.list(q);
      setPatients(data);
    } catch {
      // silent
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const load = async () => {
      setIsLoadingProfessionals(true);
      try {
        const data = await professionalService.listActive();
        setProfessionals(data);
      } catch {
        // silent
      } finally {
        setIsLoadingProfessionals(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (preselectedPatientId && patients.length > 0 && !selectedPatientName) {
      const found = patients.find((p) => p.id === preselectedPatientId);
      if (found) setSelectedPatientName(found.fullName);
    }
  }, [patients, preselectedPatientId, selectedPatientName]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchPatients(query || undefined);
    }, 300);
    return () => clearTimeout(t);
  }, [query, fetchPatients]);

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
    return new Date(`${isoDate}T${time}:00`).toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientId) { setError('Selecione um paciente.'); return; }
    if (!professionalId) { setError('Selecione um profissional responsável.'); return; }
    if (!scheduledDate || !scheduledStart || !scheduledEnd) {
      setError('Preencha a data, horário de início e término.'); return;
    }

    const isoDate = fromDisplayDate(scheduledDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      setError('A data deve estar no formato DD/MM/AAAA.'); return;
    }

    const start = buildDateTime(scheduledDate, scheduledStart);
    const end = buildDateTime(scheduledDate, scheduledEnd);

    if (new Date(start) < new Date()) {
      setError('Não é possível agendar consultas no passado.'); return;
    }
    if (start >= end) {
      setError('O horário de término deve ser posterior ao de início.'); return;
    }
    if (!user) {
      setError('Profissional não identificado. Faça login novamente.'); return;
    }

    setIsSaving(true);
    try {
      await appointmentService.create({
        patientId,
        professionalId,
        scheduledDate: new Date(`${isoDate}T00:00:00`).toISOString(),
        scheduledStart: start,
        scheduledEnd: end,
        notes: notes.trim() || undefined,
      });
      navigate('/agendamentos');
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Erro ao criar agendamento.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    patients, isLoadingPatients,
    professionals, isLoadingProfessionals, professionalId, setProfessionalId,
    patientId, selectedPatientName,
    scheduledDate, scheduledStart, scheduledEnd, notes,
    isSaving, error,
    query, setQuery, showResults, setShowResults, wrapperRef,
    selectPatient, clearPatient,
    handleDateChange, setScheduledStart, setScheduledEnd, setNotes,
    handleSubmit,
    goBack: () => navigate(-1),
  };
}
