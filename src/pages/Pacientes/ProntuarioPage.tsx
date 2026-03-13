import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CalendarDays,
  Heart,
  ClipboardPlus,
  Pencil,
  ChevronDown,
  ChevronUp,
  Loader2,
  Stethoscope,
  Clock,
  FileText,
  Pill,
  Home,
  RotateCcw,
  Bug,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import type {
  Patient,
  Anamnesis,
  Appointment,
  MaritalStatus,
  Perfusion,
  PainSensitivity,
  BodyPart,
} from '@/types';

const MARITAL_LABELS: Record<MaritalStatus, string> = {
  single: 'Solteiro(a)',
  married: 'Casado(a)',
  divorced: 'Divorciado(a)',
  widowed: 'Viúvo(a)',
  other: 'Outro',
};

const PERFUSION_LABELS: Record<Perfusion, string> = {
  normal: 'Normal',
  pale: 'Pálida',
  cyanotic: 'Cianótica',
  edematous: 'Edematosa',
};

const PAIN_LABELS: Record<PainSensitivity, string> = {
  none: 'Nenhuma',
  low: 'Baixa',
  moderate: 'Moderada',
  high: 'Alta',
};

const BODY_PART_LABELS: Record<BodyPart, string> = {
  right_foot: 'Pé direito',
  left_foot: 'Pé esquerdo',
  right_hand: 'Mão direita',
  left_hand: 'Mão esquerda',
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-blue-50 text-blue-700' },
  confirmed: { label: 'Confirmada', className: 'bg-indigo-50 text-indigo-700' },
  in_progress: { label: 'Em atendimento', className: 'bg-yellow-50 text-yellow-700' },
  completed: { label: 'Concluída', className: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-500' },
};

const formatCpf = (cpf: string) => {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.***.***-${d.slice(9)}`;
};

const formatPhone = (phone: string | null) => {
  if (!phone) return null;
  const d = phone.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
};

const formatDate = (date: string | null) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('pt-BR');
};

const formatTime = (datetime: string) => {
  return new Date(datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | null | undefined }> = ({
  icon,
  label,
  value,
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 text-gray-400 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
};

const BoolBadge: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      active
        ? 'bg-danger-50 text-danger-700'
        : 'bg-gray-100 text-gray-400'
    }`}
  >
    {label}
  </span>
);

const ProntuarioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [anamnesis, setAnamnesis] = useState<Anamnesis | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anamnesisOpen, setAnamnesisOpen] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [patientRes, anamnesisRes, appointmentsRes] = await Promise.all([
        api.get<{ data: Patient }>(`/api/patients/${id}`),
        api.get<{ data: Anamnesis[] }>(`/api/anamneses/patient/${id}`),
        api.get<{ data: Appointment[] }>(`/api/appointments/patient/${id}`),
      ]);
      setPatient(patientRes.data);
      setAnamnesis(anamnesisRes.data.length > 0 ? anamnesisRes.data[0] : null);
      setAppointments(appointmentsRes.data);
    } catch {
      navigate('/pacientes');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!patient) return null;

  const address = [patient.street, patient.addressNumber, patient.neighborhood, patient.city, patient.state]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/pacientes')}
          >
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Prontuário</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Pencil size={14} />}
            onClick={() => navigate(`/pacientes/${id}/editar`)}
          >
            Editar Paciente
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ClipboardPlus size={14} />}
            onClick={() => navigate(`/pacientes/${id}/anamnese/nova`)}
          >
            {anamnesis ? 'Editar Anamnese' : 'Nova Anamnese'}
          </Button>
        </div>
      </div>

      {/* Patient Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold text-lg flex-shrink-0">
            {patient.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-800 truncate">{patient.fullName}</h2>
            <p className="text-sm text-gray-400 mt-0.5">CPF: {formatCpf(patient.cpf)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1 mt-6">
          <InfoItem
            icon={<CalendarDays size={16} />}
            label="Data de nascimento"
            value={formatDate(patient.dateOfBirth)}
          />
          <InfoItem
            icon={<Heart size={16} />}
            label="Estado civil"
            value={MARITAL_LABELS[patient.maritalStatus]}
          />
          <InfoItem
            icon={<Briefcase size={16} />}
            label="Profissão"
            value={patient.occupation}
          />
          <InfoItem
            icon={<Phone size={16} />}
            label="Telefone"
            value={formatPhone(patient.phoneNumber)}
          />
          <InfoItem
            icon={<Mail size={16} />}
            label="E-mail"
            value={patient.email}
          />
          <InfoItem
            icon={<MapPin size={16} />}
            label="Endereço"
            value={address || null}
          />
          {patient.zipCode && (
            <InfoItem
              icon={<MapPin size={16} />}
              label="CEP"
              value={patient.zipCode}
            />
          )}
        </div>
      </div>

      {/* Anamnesis Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setAnamnesisOpen((prev) => !prev)}
          className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <ClipboardPlus size={20} className="text-primary-500" />
            <div>
              <p className="text-base font-semibold text-gray-700">Anamnese</p>
              {anamnesis ? (
                <p className="text-xs text-gray-400 mt-0.5">
                  Perfusão: {PERFUSION_LABELS[anamnesis.perfusion]} · Dor: {PAIN_LABELS[anamnesis.painSensitivity ?? 'none']}
                  {' · Atualizada em '}{formatDate(anamnesis.updatedAt)}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">Nenhuma anamnese cadastrada</p>
              )}
            </div>
          </div>
          {anamnesisOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>

        {anamnesisOpen && (
          <div className="px-6 pb-6 space-y-5 border-t border-gray-100 pt-4">
            {!anamnesis ? (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-3">Nenhuma anamnese cadastrada.</p>
                <Button size="sm" icon={<ClipboardPlus size={14} />} onClick={() => navigate(`/pacientes/${id}/anamnese/nova`)}>
                  Cadastrar anamnese
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" icon={<Pencil size={14} />} onClick={() => navigate(`/pacientes/${id}/anamnese/nova`)}>
                    Editar
                  </Button>
                </div>

                {/* Hábitos */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Hábitos e Estilo de Vida</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    {anamnesis.frequentlyUsedFootwear && (
                      <div><span className="text-xs text-gray-400">Calçados</span><p className="text-gray-700">{anamnesis.frequentlyUsedFootwear}</p></div>
                    )}
                    {anamnesis.frequentlyUsedSocks && (
                      <div><span className="text-xs text-gray-400">Meias</span><p className="text-gray-700">{anamnesis.frequentlyUsedSocks}</p></div>
                    )}
                    {anamnesis.practicedSports && (
                      <div><span className="text-xs text-gray-400">Esportes</span><p className="text-gray-700">{anamnesis.practicedSports}</p></div>
                    )}
                  </div>
                </div>

                {/* Histórico Médico */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Histórico Médico</h3>
                  <div className="flex flex-wrap gap-2">
                    <BoolBadge label="Hipertensão" active={anamnesis.hasHypertension} />
                    <BoolBadge label="Diabetes" active={anamnesis.hasDiabetes} />
                    <BoolBadge label="Problemas circulatórios" active={anamnesis.hasCirculatoryProblems} />
                    <BoolBadge label="Problemas de cicatrização" active={anamnesis.hasHealingProblems} />
                    <BoolBadge label="Convulsões" active={anamnesis.hasSeizures} />
                    <BoolBadge label="Histórico de câncer" active={anamnesis.hasCancerHistory} />
                    <BoolBadge label="Marcapasso/Pinos" active={anamnesis.hasPacemakerOrPins} />
                    <BoolBadge label="Gestante" active={anamnesis.isPregnant} />
                    <BoolBadge label="Cirurgia MMII" active={anamnesis.hasLowerLimbSurgery} />
                  </div>
                  {anamnesis.hasLowerLimbSurgery && anamnesis.lowerLimbSurgeryDetails && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">{anamnesis.lowerLimbSurgeryDetails}</p>
                  )}
                  {anamnesis.medicationsInUse && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-400">Medicamentos em uso</span>
                      <p className="text-sm text-gray-700 mt-0.5">{anamnesis.medicationsInUse}</p>
                    </div>
                  )}
                </div>

                {/* Avaliação Podológica */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Avaliação Podológica</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-xs text-gray-400">Perfusão</span><p className="text-gray-700">{PERFUSION_LABELS[anamnesis.perfusion]}</p></div>
                    <div><span className="text-xs text-gray-400">Sensibilidade à dor</span><p className="text-gray-700">{PAIN_LABELS[anamnesis.painSensitivity ?? 'none']}</p></div>
                    <div><span className="text-xs text-gray-400">Monofilamento</span><p className="text-gray-700">{anamnesis.hasMonofilamentSensitivity ? 'Sensível' : 'Insensível'}</p></div>
                  </div>
                  {anamnesis.dermatologicalPathologies && (
                    <div className="mt-3"><span className="text-xs text-gray-400">Patologias dermatológicas</span><p className="text-sm text-gray-700 mt-0.5">{anamnesis.dermatologicalPathologies}</p></div>
                  )}
                  {anamnesis.nailPathologies && (
                    <div className="mt-3"><span className="text-xs text-gray-400">Patologias ungueais</span><p className="text-sm text-gray-700 mt-0.5">{anamnesis.nailPathologies}</p></div>
                  )}
                </div>

                {anamnesis.otherObservations && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Observações</h3>
                    <p className="text-sm text-gray-700">{anamnesis.otherObservations}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Consultations History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope size={20} className="text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-800">Histórico de Consultas</h2>
          </div>
          <span className="text-xs text-gray-400">
            {appointments.length} consulta{appointments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm">Nenhuma consulta registrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const isOpen = expandedAppointment === appt.id;
              const status = STATUS_LABELS[appt.status] ?? STATUS_LABELS['scheduled'];
              const evolutions = appt.clinicalEvolutions ?? [];

              return (
                <div key={appt.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedAppointment(isOpen ? null : appt.id)}
                    className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Clock size={16} className="text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-700">
                          {formatDate(appt.scheduledDate)} · {formatTime(appt.scheduledStart)} - {formatTime(appt.scheduledEnd)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                          {(appt.professional?.fullName || appt.user?.professionalName) && (
                            <span className="text-xs text-gray-400">{appt.professional?.fullName || appt.user?.professionalName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
                      {appt.notes && (
                        <div>
                          <span className="text-xs text-gray-400">Observações do agendamento</span>
                          <p className="text-sm text-gray-700 mt-1">{appt.notes}</p>
                        </div>
                      )}

                      {evolutions.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Nenhuma evolução clínica registrada.</p>
                      ) : (
                        evolutions.map((evo) => (
                          <div key={evo.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <p className="text-xs text-gray-400">Evolução — {formatDate(evo.createdAt)}</p>

                            {evo.clinicalNotes && (
                              <div className="flex items-start gap-2">
                                <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div><span className="text-xs text-gray-400">Notas clínicas</span><p className="text-sm text-gray-700">{evo.clinicalNotes}</p></div>
                              </div>
                            )}

                            {evo.prescribedMedications && (
                              <div className="flex items-start gap-2">
                                <Pill size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div><span className="text-xs text-gray-400">Medicamentos prescritos</span><p className="text-sm text-gray-700">{evo.prescribedMedications}</p></div>
                              </div>
                            )}

                            {evo.homeCareRecommendations && (
                              <div className="flex items-start gap-2">
                                <Home size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div><span className="text-xs text-gray-400">Cuidados domiciliares</span><p className="text-sm text-gray-700">{evo.homeCareRecommendations}</p></div>
                              </div>
                            )}

                            {evo.recommendedReturnDays !== null && evo.recommendedReturnDays !== undefined && (
                              <div className="flex items-start gap-2">
                                <RotateCcw size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div><span className="text-xs text-gray-400">Retorno recomendado</span><p className="text-sm text-gray-700">{evo.recommendedReturnDays} dias</p></div>
                              </div>
                            )}

                            {evo.evolutionPathologies && evo.evolutionPathologies.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Bug size={14} className="text-gray-400" />
                                  <span className="text-xs text-gray-400">Patologias identificadas</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {evo.evolutionPathologies.map((ep) => (
                                    <span
                                      key={`${ep.pathologyId}-${ep.bodyPart}`}
                                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700"
                                      title={ep.notes ?? undefined}
                                    >
                                      {ep.pathology?.name ?? ep.pathologyId} — {BODY_PART_LABELS[ep.bodyPart]}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProntuarioPage;
