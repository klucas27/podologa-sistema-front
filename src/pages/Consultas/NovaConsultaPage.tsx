import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import type { Patient, Pathology, BodyPart } from '@/types';

const BODY_PART_OPTIONS: { value: BodyPart; label: string }[] = [
  { value: 'right_foot', label: 'Pé direito' },
  { value: 'left_foot', label: 'Pé esquerdo' },
  { value: 'right_hand', label: 'Mão direita' },
  { value: 'left_hand', label: 'Mão esquerda' },
];

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Agendada' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluída' },
];

interface PathologyRow {
  pathologyId: string;
  bodyPart: BodyPart;
  notes: string;
}

const NovaConsultaPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId') ?? '';

  // Lookup data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pathologies, setPathologies] = useState<Pathology[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Appointment form
  const [patientId, setPatientId] = useState(preselectedPatientId);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [notes, setNotes] = useState('');

  // Clinical evolution
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescribedMedications, setPrescribedMedications] = useState('');
  const [homeCareRecommendations, setHomeCareRecommendations] = useState('');
  const [recommendedReturnDays, setRecommendedReturnDays] = useState('');

  // Pathologies
  const [pathologyRows, setPathologyRows] = useState<PathologyRow[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchLookupData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [patientsRes, pathologiesRes] = await Promise.all([
        api.get<{ data: Patient[] }>('/api/patients'),
        api.get<{ data: Pathology[] }>('/api/pathologies'),
      ]);
      setPatients(patientsRes.data);
      setPathologies(pathologiesRes.data);
    } catch {
      // silent
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchLookupData();
  }, [fetchLookupData]);

  const addPathologyRow = () => {
    setPathologyRows((prev) => [
      ...prev,
      { pathologyId: '', bodyPart: 'right_foot', notes: '' },
    ]);
  };

  const updatePathologyRow = (idx: number, patch: Partial<PathologyRow>) => {
    setPathologyRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    );
  };

  const removePathologyRow = (idx: number) => {
    setPathologyRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildDateTime = (date: string, time: string) => {
    if (!date || !time) return '';
    return new Date(`${date}T${time}:00`).toISOString();
  };

  const hasEvolutionData =
    clinicalNotes.trim() ||
    prescribedMedications.trim() ||
    homeCareRecommendations.trim() ||
    recommendedReturnDays.trim();

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

    setIsSaving(true);
    try {
      // 1. Create appointment
      const apptRes = await api.post<{ data: { id: string } }>('/api/appointments', {
        patientId,
        scheduledDate: new Date(`${scheduledDate}T00:00:00`).toISOString(),
        scheduledStart: start,
        scheduledEnd: end,
        status,
        notes: notes.trim() || null,
      });

      const appointmentId = apptRes.data.id;

      // 2. Create clinical evolution if there's any data
      if (hasEvolutionData) {
        const evoRes = await api.post<{ data: { id: string } }>('/api/clinical-evolutions', {
          appointmentId,
          clinicalNotes: clinicalNotes.trim() || null,
          prescribedMedications: prescribedMedications.trim() || null,
          homeCareRecommendations: homeCareRecommendations.trim() || null,
          recommendedReturnDays: recommendedReturnDays ? Number(recommendedReturnDays) : null,
        });

        const evolutionId = evoRes.data.id;

        // 3. Create evolution pathologies
        const validRows = pathologyRows.filter((r) => r.pathologyId);
        for (const row of validRows) {
          await api.post('/api/evolution-pathologies', {
            evolutionId,
            pathologyId: row.pathologyId,
            bodyPart: row.bodyPart,
            notes: row.notes.trim() || null,
          });
        }
      }

      // Navigate back
      if (preselectedPatientId) {
        navigate(`/pacientes/${preselectedPatientId}`);
      } else {
        navigate('/consultas');
      }
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Erro ao salvar consulta.';
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Nova Consulta</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Appointment data */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-700">Agendamento</h2>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

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

        {/* Clinical evolution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-700">Evolução Clínica</h2>
          <p className="text-xs text-gray-400 -mt-2">Preencha caso já tenha dados clínicos. Pode ser adicionado depois.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas clínicas</label>
            <textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none"
              placeholder="Descreva os achados clínicos..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicamentos prescritos</label>
            <textarea
              value={prescribedMedications}
              onChange={(e) => setPrescribedMedications(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none"
              placeholder="Medicamentos receitados..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuidados domiciliares</label>
            <textarea
              value={homeCareRecommendations}
              onChange={(e) => setHomeCareRecommendations(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none"
              placeholder="Orientações e cuidados em casa..."
            />
          </div>

          <div className="sm:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Retorno recomendado (dias)</label>
            <input
              type="number"
              min={0}
              value={recommendedReturnDays}
              onChange={(e) => setRecommendedReturnDays(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
              placeholder="Ex.: 30"
            />
          </div>
        </div>

        {/* Pathologies */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-700">Patologias Identificadas</h2>
              <p className="text-xs text-gray-400">Associe patologias à evolução clínica.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={addPathologyRow}
            >
              Adicionar
            </Button>
          </div>

          {pathologyRows.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">Nenhuma patologia adicionada.</p>
          ) : (
            <div className="space-y-3">
              {pathologyRows.map((row, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Patologia</label>
                    <select
                      value={row.pathologyId}
                      onChange={(e) => updatePathologyRow(idx, { pathologyId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
                    >
                      <option value="">Selecione</option>
                      {pathologies.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:w-40">
                    <label className="block text-xs text-gray-500 mb-1">Local</label>
                    <select
                      value={row.bodyPart}
                      onChange={(e) => updatePathologyRow(idx, { bodyPart: e.target.value as BodyPart })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
                    >
                      {BODY_PART_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Observação</label>
                    <input
                      type="text"
                      value={row.notes}
                      onChange={(e) => updatePathologyRow(idx, { notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removePathologyRow(idx)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Salvar Consulta
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NovaConsultaPage;
