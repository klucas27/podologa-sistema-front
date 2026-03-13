import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { Patient, Professional } from '@/types';

/* ─── Helpers ─── */
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

/** Auto-format raw digits into DD/MM/YYYY as the user types */
const applyDateMask = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const formatPhone = (phone: string | null): string => {
  if (!phone) return '';
  const d = phone.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
};

/* ─── Component ─── */
const NovaConsultaPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const preselectedPatientId = searchParams.get('patientId') ?? '';
  const preselectedDate = searchParams.get('date') ?? '';
  const preselectedStart = searchParams.get('startTime') ?? '';
  const preselectedEnd = searchParams.get('endTime') ?? '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  // Professionals
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(true);
  const [professionalId, setProfessionalId] = useState('');

  // Selected patient
  const [patientId, setPatientId] = useState(preselectedPatientId);
  const [selectedPatientName, setSelectedPatientName] = useState('');

  // Form fields
  const [scheduledDate, setScheduledDate] = useState(() => toDisplayDate(preselectedDate));
  const [scheduledStart, setScheduledStart] = useState(preselectedStart);
  const [scheduledEnd, setScheduledEnd] = useState(preselectedEnd);
  const [notes, setNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Autocomplete state
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const fetchPatients = useCallback(async (q?: string) => {
    setIsLoadingPatients(true);
    try {
      const params = q ? { params: { search: q } } : undefined;
      const res = await api.get<{ data: Patient[] }>('/api/patients', params);
      setPatients(res.data);
    } catch {
      // silent
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Load active professionals
  useEffect(() => {
    const fetchProfessionals = async () => {
      setIsLoadingProfessionals(true);
      try {
        const res = await api.get<{ data: Professional[] }>('/api/professionals/active');
        setProfessionals(res.data);
      } catch {
        // silent
      } finally {
        setIsLoadingProfessionals(false);
      }
    };
    fetchProfessionals();
  }, []);

  // Resolve preselected patient name once patients load
  useEffect(() => {
    if (preselectedPatientId && patients.length > 0 && !selectedPatientName) {
      const found = patients.find((p) => p.id === preselectedPatientId);
      if (found) setSelectedPatientName(found.fullName);
    }
  }, [patients, preselectedPatientId, selectedPatientName]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchPatients(query || undefined);
    }, 300);
    return () => clearTimeout(t);
  }, [query, fetchPatients]);

  // Close dropdown on outside click
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

    if (!patientId) {
      setError('Selecione um paciente.');
      return;
    }
    if (!professionalId) {
      setError('Selecione um profissional responsável.');
      return;
    }
    if (!scheduledDate || !scheduledStart || !scheduledEnd) {
      setError('Preencha a data, horário de início e término.');
      return;
    }

    const isoDate = fromDisplayDate(scheduledDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      setError('A data deve estar no formato DD/MM/AAAA.');
      return;
    }

    const start = buildDateTime(scheduledDate, scheduledStart);
    const end = buildDateTime(scheduledDate, scheduledEnd);

    if (new Date(start) < new Date()) {
      setError('Não é possível agendar consultas no passado.');
      return;
    }

    if (start >= end) {
      setError('O horário de término deve ser posterior ao de início.');
      return;
    }

    if (!user) {
      setError('Profissional não identificado. Faça login novamente.');
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/api/appointments', {
        patientId,
        userId: user.id,
        professionalId,
        scheduledDate: new Date(`${isoDate}T00:00:00`).toISOString(),
        scheduledStart: start,
        scheduledEnd: end,
        status: 'scheduled',
        notes: notes.trim() || null,
      });
      navigate('/agendamentos');
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Erro ao criar agendamento.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingPatients && patients.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={24} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Novo Agendamento</h1>
          <p className="text-sm text-gray-500">Agende uma nova consulta para o paciente.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Patient autocomplete */}
          <div>
            <label htmlFor="patient-search" className="block text-sm font-medium text-gray-700 mb-1">
              Paciente <span className="text-danger-500">*</span>
            </label>

            {patientId && selectedPatientName ? (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-primary-200 bg-primary-50 text-sm">
                <span className="font-medium text-primary-800">{selectedPatientName}</span>
                <button
                  type="button"
                  onClick={clearPatient}
                  className="p-0.5 rounded text-gray-400 hover:text-gray-600 transition"
                  aria-label="Remover paciente selecionado"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div ref={wrapperRef} className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="patient-search"
                  type="text"
                  role="combobox"
                  aria-expanded={showResults}
                  aria-autocomplete="list"
                  aria-label="Buscar paciente por nome ou telefone"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Buscar por nome ou telefone..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
                />

                {showResults && (
                  <div
                    role="listbox"
                    className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                  >
                    {isLoadingPatients ? (
                      <div className="flex items-center justify-center p-3">
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                      </div>
                    ) : patients.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        Nenhum paciente encontrado.
                      </div>
                    ) : (
                      patients.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          role="option"
                          aria-selected={patientId === p.id}
                          onClick={() => selectPatient(p)}
                          className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-xs flex-shrink-0">
                            {p.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800 truncate">{p.fullName}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {p.phoneNumber ? formatPhone(p.phoneNumber) : 'Sem telefone'}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Professional select */}
          <div>
            <label htmlFor="professional-select" className="block text-sm font-medium text-gray-700 mb-1">
              Profissional Responsável <span className="text-danger-500">*</span>
            </label>
            {isLoadingProfessionals ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                Carregando profissionais...
              </div>
            ) : (
              <select
                id="professional-select"
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
              >
                <option value="">Selecione um profissional...</option>
                {professionals.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.fullName}{prof.specialty ? ` — ${prof.specialty}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="scheduled-date" className="block text-sm font-medium text-gray-700 mb-1">
                Data <span className="text-danger-500">*</span>
              </label>
              <input
                id="scheduled-date"
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                maxLength={10}
                value={scheduledDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="scheduled-start" className="block text-sm font-medium text-gray-700 mb-1">
                Início <span className="text-danger-500">*</span>
              </label>
              <input
                id="scheduled-start"
                type="time"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="scheduled-end" className="block text-sm font-medium text-gray-700 mb-1">
                Término <span className="text-danger-500">*</span>
              </label>
              <input
                id="scheduled-end"
                type="time"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="appointment-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              id="appointment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none"
              placeholder="Observações do agendamento..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Agendar Consulta
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NovaConsultaPage;
