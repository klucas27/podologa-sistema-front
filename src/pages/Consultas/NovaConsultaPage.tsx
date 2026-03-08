import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { Patient } from '@/types';

const NovaConsultaPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const preselectedPatientId = searchParams.get('patientId') ?? '';
  const preselectedDate = searchParams.get('date') ?? '';
  const preselectedStart = searchParams.get('startTime') ?? '';
  const preselectedEnd = searchParams.get('endTime') ?? '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [patientId, setPatientId] = useState(preselectedPatientId);
  const [scheduledDate, setScheduledDate] = useState(preselectedDate);
  const [scheduledStart, setScheduledStart] = useState(preselectedStart);
  const [scheduledEnd, setScheduledEnd] = useState(preselectedEnd);
  const [notes, setNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchPatients = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const res = await api.get<{ data: Patient[] }>('/api/patients');
      setPatients(res.data);
    } catch {
      // silent
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const buildDateTime = (date: string, time: string) => {
    if (!date || !time) return '';
    return new Date(`${date}T${time}:00`).toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientId) {
      setError('Selecione um paciente.');
      return;
    }
    if (!scheduledDate || !scheduledStart || !scheduledEnd) {
      setError('Preencha data, hora de início e hora de término.');
      return;
    }

    const start = buildDateTime(scheduledDate, scheduledStart);
    const end = buildDateTime(scheduledDate, scheduledEnd);

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
        scheduledDate: new Date(`${scheduledDate}T00:00:00`).toISOString(),
        scheduledStart: start,
        scheduledEnd: end,
        status: 'scheduled',
        notes: notes.trim() || null,
      });

      navigate('/agendamentos');
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Erro ao agendar consulta.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
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
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
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
          {/* Patient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paciente <span className="text-danger-500">*</span>
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
            >
              <option value="">Selecione um paciente</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.fullName}</option>
              ))}
            </select>
          </div>

          {/* Professional (read-only, current user) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profissional
            </label>
            <input
              type="text"
              readOnly
              value={user?.professionalName || user?.username || ''}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600 outline-none cursor-not-allowed"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Início <span className="text-danger-500">*</span>
              </label>
              <input
                type="time"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Término <span className="text-danger-500">*</span>
              </label>
              <input
                type="time"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
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
