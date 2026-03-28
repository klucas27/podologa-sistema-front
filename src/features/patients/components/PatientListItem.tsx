import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil, Trash2, ChevronRight, Phone, Loader2,
  ClipboardCheck, AlertTriangle,
} from 'lucide-react';
import type { Patient, Anamnesis } from '@/types';

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

const getActiveConditions = (anamnesis: Anamnesis): string[] =>
  MEDICAL_HISTORY_LABELS.filter(({ key }) => anamnesis[key] === true).map(({ label }) => label);

const formatCpf = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
};

const formatPhone = (phone: string | null) => {
  if (!phone) return '—';
  const d = phone.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
};

interface Props {
  patient: Patient;
  deletingId: string | null;
  onDelete: (id: string, name: string) => void;
  onForceDelete: (id: string, name: string) => void;
}

const PatientListItem: React.FC<Props> = ({ patient, deletingId, onDelete, onForceDelete }) => {
  const navigate = useNavigate();

  return (
    <li
      className="group flex items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 hover:bg-gray-50 transition cursor-pointer"
      onClick={() => navigate(`/pacientes/${patient.id}`)}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex-shrink-0">
        {patient.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{patient.fullName}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
          <span className="text-xs text-gray-400">CPF: {formatCpf(patient.cpf)}</span>
          {patient.phoneNumber && (
            <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={12} />{formatPhone(patient.phoneNumber)}</span>
          )}
          {(patient._count?.anamneses ?? 0) > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"><ClipboardCheck size={12} />Anamnese</span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">Sem anamnese</span>
          )}
        </div>
        {patient.anamneses && patient.anamneses.length > 0 && (() => {
          const conditions = getActiveConditions(patient.anamneses[0]!);
          return conditions.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {conditions.map((cond) => (
                <span key={cond} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">{cond}</span>
              ))}
            </div>
          ) : null;
        })()}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={(e) => { e.stopPropagation(); navigate(`/pacientes/${patient.id}/editar`); }} type="button" className="p-2 rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition" title="Editar paciente"><Pencil size={16} /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(patient.id, patient.fullName); }} disabled={deletingId === patient.id} type="button" className="p-2 rounded-lg text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition disabled:opacity-50" title="Excluir paciente">
          {deletingId === patient.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onForceDelete(patient.id, patient.fullName); }} disabled={deletingId === patient.id} type="button" className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50" title="Exclusão definitiva (remove tudo)"><AlertTriangle size={16} /></button>
      </div>

      <ChevronRight size={16} className="text-gray-300 flex-shrink-0 hidden sm:block" />
    </li>
  );
};

export default PatientListItem;
