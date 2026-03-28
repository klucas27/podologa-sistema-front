import React from "react";
import {
  ClipboardPlus,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Button from "@/components/ui/Button";
import type { Anamnesis } from "@/types";
import { PERFUSION_LABELS, PAIN_LABELS, formatDate } from "../constants";

const BoolBadge: React.FC<{ label: string; active: boolean }> = ({
  label,
  active,
}) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      active ? "bg-danger-50 text-danger-700" : "bg-gray-100 text-gray-400"
    }`}
  >
    {label}
  </span>
);

interface AnamnesisSectionProps {
  anamnesis: Anamnesis | null;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
  patientId: string;
}

const AnamnesisSection: React.FC<AnamnesisSectionProps> = ({
  anamnesis,
  isOpen,
  onToggle,
  onNavigate,
  patientId,
}) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-gray-50 transition"
    >
      <div className="flex items-center gap-3">
        <ClipboardPlus size={20} className="text-primary-500" />
        <div>
          <p className="text-base font-semibold text-gray-700">Anamnese</p>
          {anamnesis ? (
            <p className="text-xs text-gray-400 mt-0.5">
              Perfusão: {PERFUSION_LABELS[anamnesis.perfusion]} · Dor:{" "}
              {PAIN_LABELS[anamnesis.painSensitivity ?? "none"]}
              {" · Atualizada em "}
              {formatDate(anamnesis.updatedAt)}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">
              Nenhuma anamnese cadastrada
            </p>
          )}
        </div>
      </div>
      {isOpen ? (
        <ChevronUp size={18} className="text-gray-400" />
      ) : (
        <ChevronDown size={18} className="text-gray-400" />
      )}
    </button>

    {isOpen && (
      <div className="px-6 pb-6 space-y-5 border-t border-gray-100 pt-4">
        {!anamnesis ? (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm mb-3">
              Nenhuma anamnese cadastrada.
            </p>
            <Button
              size="sm"
              icon={<ClipboardPlus size={14} />}
              onClick={() =>
                onNavigate(`/pacientes/${patientId}/anamnese/nova`)
              }
            >
              Cadastrar anamnese
            </Button>
          </div>
        ) : (
          <AnamnesisDetails
            anamnesis={anamnesis}
            onEdit={() =>
              onNavigate(`/pacientes/${patientId}/anamnese/nova`)
            }
          />
        )}
      </div>
    )}
  </div>
);

const AnamnesisDetails: React.FC<{
  anamnesis: Anamnesis;
  onEdit: () => void;
}> = ({ anamnesis, onEdit }) => (
  <>
    <div className="flex justify-end">
      <Button
        variant="ghost"
        size="sm"
        icon={<Pencil size={14} />}
        onClick={onEdit}
      >
        Editar
      </Button>
    </div>

    <div>
      <h3 className="text-sm font-semibold text-gray-600 mb-2">
        Hábitos e Estilo de Vida
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        {anamnesis.frequentlyUsedFootwear && (
          <div>
            <span className="text-xs text-gray-400">Calçados</span>
            <p className="text-gray-700">
              {anamnesis.frequentlyUsedFootwear}
            </p>
          </div>
        )}
        {anamnesis.frequentlyUsedSocks && (
          <div>
            <span className="text-xs text-gray-400">Meias</span>
            <p className="text-gray-700">{anamnesis.frequentlyUsedSocks}</p>
          </div>
        )}
        {anamnesis.practicedSports && (
          <div>
            <span className="text-xs text-gray-400">Esportes</span>
            <p className="text-gray-700">{anamnesis.practicedSports}</p>
          </div>
        )}
      </div>
    </div>

    <div>
      <h3 className="text-sm font-semibold text-gray-600 mb-2">
        Histórico Médico
      </h3>
      <div className="flex flex-wrap gap-2">
        <BoolBadge label="Hipertensão" active={anamnesis.hasHypertension} />
        <BoolBadge label="Diabetes" active={anamnesis.hasDiabetes} />
        <BoolBadge
          label="Problemas circulatórios"
          active={anamnesis.hasCirculatoryProblems}
        />
        <BoolBadge
          label="Problemas de cicatrização"
          active={anamnesis.hasHealingProblems}
        />
        <BoolBadge label="Convulsões" active={anamnesis.hasSeizures} />
        <BoolBadge
          label="Histórico de câncer"
          active={anamnesis.hasCancerHistory}
        />
        <BoolBadge
          label="Marcapasso/Pinos"
          active={anamnesis.hasPacemakerOrPins}
        />
        <BoolBadge label="Gestante" active={anamnesis.isPregnant} />
        <BoolBadge
          label="Cirurgia MMII"
          active={anamnesis.hasLowerLimbSurgery}
        />
      </div>
      {anamnesis.hasLowerLimbSurgery && anamnesis.lowerLimbSurgeryDetails && (
        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
          {anamnesis.lowerLimbSurgeryDetails}
        </p>
      )}
      {anamnesis.medicationsInUse && (
        <div className="mt-3">
          <span className="text-xs text-gray-400">Medicamentos em uso</span>
          <p className="text-sm text-gray-700 mt-0.5">
            {anamnesis.medicationsInUse}
          </p>
        </div>
      )}
    </div>

    <div>
      <h3 className="text-sm font-semibold text-gray-600 mb-2">
        Avaliação Podológica
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <span className="text-xs text-gray-400">Perfusão</span>
          <p className="text-gray-700">
            {PERFUSION_LABELS[anamnesis.perfusion]}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-400">Sensibilidade à dor</span>
          <p className="text-gray-700">
            {PAIN_LABELS[anamnesis.painSensitivity ?? "none"]}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-400">Monofilamento</span>
          <p className="text-gray-700">
            {anamnesis.hasMonofilamentSensitivity ? "Sensível" : "Insensível"}
          </p>
        </div>
      </div>
      {anamnesis.dermatologicalPathologies && (
        <div className="mt-3">
          <span className="text-xs text-gray-400">
            Patologias dermatológicas
          </span>
          <p className="text-sm text-gray-700 mt-0.5">
            {anamnesis.dermatologicalPathologies}
          </p>
        </div>
      )}
      {anamnesis.nailPathologies && (
        <div className="mt-3">
          <span className="text-xs text-gray-400">Patologias ungueais</span>
          <p className="text-sm text-gray-700 mt-0.5">
            {anamnesis.nailPathologies}
          </p>
        </div>
      )}
    </div>

    {anamnesis.otherObservations && (
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">
          Observações
        </h3>
        <p className="text-sm text-gray-700">{anamnesis.otherObservations}</p>
      </div>
    )}
  </>
);

export default AnamnesisSection;
