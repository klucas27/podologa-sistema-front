import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  PlayCircle,
  FileText,
  Pill,
  Home,
  RotateCcw,
  Bug,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import type {
  Appointment,
  AppointmentStatus,
  Pathology,
  BodyPart,
  ClinicalEvolution,
  EvolutionPathology,
} from '@/types';

const BODY_PART_OPTIONS: { value: BodyPart; label: string }[] = [
  { value: 'right_foot', label: 'Pé direito' },
  { value: 'left_foot', label: 'Pé esquerdo' },
  { value: 'right_hand', label: 'Mão direita' },
  { value: 'left_hand', label: 'Mão esquerda' },
];

const BODY_PART_LABELS: Record<BodyPart, string> = {
  right_foot: 'Pé direito',
  left_foot: 'Pé esquerdo',
  right_hand: 'Mão direita',
  left_hand: 'Mão esquerda',
};

const STATUS_LABELS: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-blue-50 text-blue-700' },
  confirmed: { label: 'Confirmada', className: 'bg-cyan-50 text-cyan-700' },
  in_progress: { label: 'Em atendimento', className: 'bg-yellow-50 text-yellow-700' },
  cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-700' },
  completed: { label: 'Concluída', className: 'bg-green-50 text-green-700' },
};

const formatDate = (iso: string) => {
  const parts = iso.slice(0, 10).split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

interface PathologyRow {
  pathologyId: string;
  bodyPart: BodyPart;
  notes: string;
}

const ConsultationExecutionPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [pathologies, setPathologies] = useState<Pathology[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Existing evolution data (if consultation already has an evolution)
  const [existingEvolution, setExistingEvolution] = useState<ClinicalEvolution | null>(null);

  // Clinical evolution form
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescribedMedications, setPrescribedMedications] = useState('');
  const [homeCareRecommendations, setHomeCareRecommendations] = useState('');
  const [recommendedReturnDays, setRecommendedReturnDays] = useState('');

  // Pathology rows
  const [pathologyRows, setPathologyRows] = useState<PathologyRow[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = useCallback(async () => {
    if (!appointmentId) return;
    setIsLoading(true);
    try {
      const [apptRes, pathRes] = await Promise.all([
        api.get<{ data: Appointment }>(`/api/appointments/${appointmentId}`),
        api.get<{ data: Pathology[] }>('/api/pathologies'),
      ]);
      setAppointment(apptRes.data);
      setPathologies(pathRes.data);

      // Load existing clinical evolutions for this appointment
      const evoRes = await api.get<{ data: ClinicalEvolution[] }>(
        `/api/clinical-evolutions/appointment/${appointmentId}`,
      );
      if (evoRes.data.length > 0) {
        const evo = evoRes.data[0]!;
        setExistingEvolution(evo);
        setClinicalNotes(evo.clinicalNotes ?? '');
        setPrescribedMedications(evo.prescribedMedications ?? '');
        setHomeCareRecommendations(evo.homeCareRecommendations ?? '');
        setRecommendedReturnDays(evo.recommendedReturnDays?.toString() ?? '');

        // Load existing pathology rows
        if (evo.evolutionPathologies && evo.evolutionPathologies.length > 0) {
          setPathologyRows(
            evo.evolutionPathologies.map((ep: EvolutionPathology) => ({
              pathologyId: ep.pathologyId,
              bodyPart: ep.bodyPart,
              notes: ep.notes ?? '',
            })),
          );
        }
      }
    } catch {
      navigate('/consultas');
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (newStatus: AppointmentStatus) => {
    if (!appointmentId) return;
    setIsUpdatingStatus(true);
    setError('');
    try {
      const res = await api.patch<{ data: Appointment }>(`/api/appointments/${appointmentId}`, {
        status: newStatus,
      });
      setAppointment(res.data);
      setSuccessMessage(
        newStatus === 'in_progress'
          ? 'Consulta iniciada.'
          : newStatus === 'completed'
            ? 'Consulta finalizada.'
            : 'Status atualizado.',
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Erro ao atualizar status.';
      setError(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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

  const handleSaveEvolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId) return;
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      let evolutionId: string;

      if (existingEvolution) {
        // Update existing evolution
        await api.patch(`/api/clinical-evolutions/${existingEvolution.id}`, {
          clinicalNotes: clinicalNotes.trim() || null,
          prescribedMedications: prescribedMedications.trim() || null,
          homeCareRecommendations: homeCareRecommendations.trim() || null,
          recommendedReturnDays: recommendedReturnDays ? Number(recommendedReturnDays) : null,
        });
        evolutionId = existingEvolution.id;

        // Delete existing evolution pathologies and recreate
        if (existingEvolution.evolutionPathologies) {
          for (const ep of existingEvolution.evolutionPathologies) {
            await api.delete(`/api/evolution-pathologies/${ep.evolutionId}/${ep.pathologyId}/${ep.bodyPart}`);
          }
        }
      } else {
        // Create new evolution
        const evoRes = await api.post<{ data: { id: string } }>('/api/clinical-evolutions', {
          appointmentId,
          clinicalNotes: clinicalNotes.trim() || null,
          prescribedMedications: prescribedMedications.trim() || null,
          homeCareRecommendations: homeCareRecommendations.trim() || null,
          recommendedReturnDays: recommendedReturnDays ? Number(recommendedReturnDays) : null,
        });
        evolutionId = evoRes.data.id;
      }

      // Create pathology associations
      const validRows = pathologyRows.filter((r) => r.pathologyId);
      for (const row of validRows) {
        await api.post('/api/evolution-pathologies', {
          evolutionId,
          pathologyId: row.pathologyId,
          bodyPart: row.bodyPart,
          notes: row.notes.trim() || null,
        });
      }

      setSuccessMessage('Evolução clínica salva com sucesso.');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reload data to refresh existingEvolution
      await fetchData();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Erro ao salvar evolução clínica.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!appointment) return null;

  const status = STATUS_LABELS[appointment.status] ?? STATUS_LABELS['scheduled'];
  const isEditable = appointment.status !== 'completed' && appointment.status !== 'cancelled';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/consultas')}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Execução da Consulta</h1>
          <p className="text-sm text-gray-500">Registre a evolução clínica e patologias identificadas.</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Appointment info card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex-shrink-0">
                {appointment.patient?.fullName
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() ?? '??'}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  {appointment.patient?.fullName ?? 'Paciente'}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={14} />
                  <span>
                    {formatDate(appointment.scheduledDate)} · {formatTime(appointment.scheduledStart)} -{' '}
                    {formatTime(appointment.scheduledEnd)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                {status.label}
              </span>
              {appointment.user?.professionalName && (
                <span className="text-xs text-gray-400">Prof. {appointment.user.professionalName}</span>
              )}
            </div>
            {appointment.notes && (
              <p className="text-sm text-gray-500 italic">{appointment.notes}</p>
            )}
          </div>

          {/* Status actions */}
          <div className="flex flex-wrap gap-2">
            {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
              <Button
                size="sm"
                icon={<PlayCircle size={14} />}
                onClick={() => updateStatus('in_progress')}
                isLoading={isUpdatingStatus}
              >
                Iniciar Consulta
              </Button>
            )}
            {appointment.status === 'in_progress' && (
              <Button
                size="sm"
                variant="secondary"
                icon={<CheckCircle size={14} />}
                onClick={() => updateStatus('completed')}
                isLoading={isUpdatingStatus}
              >
                Finalizar Consulta
              </Button>
            )}
            {appointment.patient && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/pacientes/${appointment.patientId}`)}
              >
                Ver Prontuário
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Clinical evolution form */}
      <form onSubmit={handleSaveEvolution} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-primary-500" />
            <h2 className="text-base font-semibold text-gray-700">
              Evolução Clínica {existingEvolution ? '(Editando)' : ''}
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas clínicas</label>
            <textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={4}
              disabled={!isEditable}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Descreva os achados clínicos..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1"><Pill size={14} /> Medicamentos prescritos</span>
            </label>
            <textarea
              value={prescribedMedications}
              onChange={(e) => setPrescribedMedications(e.target.value)}
              rows={2}
              disabled={!isEditable}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Medicamentos receitados..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1"><Home size={14} /> Cuidados domiciliares</span>
            </label>
            <textarea
              value={homeCareRecommendations}
              onChange={(e) => setHomeCareRecommendations(e.target.value)}
              rows={2}
              disabled={!isEditable}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Orientações e cuidados em casa..."
            />
          </div>

          <div className="sm:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1"><RotateCcw size={14} /> Retorno recomendado (dias)</span>
            </label>
            <input
              type="number"
              min={0}
              value={recommendedReturnDays}
              onChange={(e) => setRecommendedReturnDays(e.target.value)}
              disabled={!isEditable}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Ex.: 30"
            />
          </div>
        </div>

        {/* Pathologies */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug size={18} className="text-orange-500" />
              <h2 className="text-base font-semibold text-gray-700">Patologias Identificadas</h2>
            </div>
            {isEditable && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={addPathologyRow}
              >
                Adicionar
              </Button>
            )}
          </div>

          {pathologyRows.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">Nenhuma patologia adicionada.</p>
          ) : (
            <div className="space-y-3">
              {pathologyRows.map((row, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Patologia</label>
                    {isEditable ? (
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
                    ) : (
                      <p className="text-sm text-gray-700">
                        {pathologies.find((p) => p.id === row.pathologyId)?.name ?? row.pathologyId}
                      </p>
                    )}
                  </div>
                  <div className="sm:w-40">
                    <label className="block text-xs text-gray-500 mb-1">Local</label>
                    {isEditable ? (
                      <select
                        value={row.bodyPart}
                        onChange={(e) => updatePathologyRow(idx, { bodyPart: e.target.value as BodyPart })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
                      >
                        {BODY_PART_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-700">{BODY_PART_LABELS[row.bodyPart]}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Observação</label>
                    {isEditable ? (
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => updatePathologyRow(idx, { notes: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
                        placeholder="Opcional"
                      />
                    ) : (
                      <p className="text-sm text-gray-700">{row.notes || '—'}</p>
                    )}
                  </div>
                  {isEditable && (
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
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {isEditable && (
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => navigate('/consultas')}>
              Voltar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {existingEvolution ? 'Atualizar Evolução' : 'Salvar Evolução'}
            </Button>
          </div>
        )}

        {!isEditable && (
          <div className="flex justify-end">
            <Button variant="secondary" type="button" onClick={() => navigate('/consultas')}>
              Voltar
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ConsultationExecutionPage;
