import React from "react";
import { FileText, Pill, Home, RotateCcw } from "lucide-react";
import type { ClinicalEvolution } from "@/types";

interface ClinicalEvolutionSectionProps {
  existingEvolution: ClinicalEvolution | null;
  isClinicalEditable: boolean;
  clinicalNotes: string;
  onClinicalNotesChange: (v: string) => void;
  prescribedMedications: string;
  onPrescribedMedicationsChange: (v: string) => void;
  homeCareRecommendations: string;
  onHomeCareRecommendationsChange: (v: string) => void;
  recommendedReturnDays: string;
  onRecommendedReturnDaysChange: (v: string) => void;
}

const ClinicalEvolutionSection: React.FC<ClinicalEvolutionSectionProps> = ({
  existingEvolution,
  isClinicalEditable,
  clinicalNotes,
  onClinicalNotesChange,
  prescribedMedications,
  onPrescribedMedicationsChange,
  homeCareRecommendations,
  onHomeCareRecommendationsChange,
  recommendedReturnDays,
  onRecommendedReturnDaysChange,
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
    <div className="flex items-center gap-2">
      <FileText size={18} className="text-primary-500" />
      <h2 className="text-base font-semibold text-gray-700">
        Evolução Clínica {existingEvolution ? "(Editando)" : ""}
      </h2>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Notas clínicas
      </label>
      <textarea
        value={clinicalNotes}
        onChange={(e) => onClinicalNotesChange(e.target.value)}
        rows={4}
        disabled={!isClinicalEditable}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none disabled:bg-gray-50 disabled:text-gray-500"
        placeholder="Descreva os achados clínicos..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <span className="flex items-center gap-1">
          <Pill size={14} /> Medicamentos prescritos
        </span>
      </label>
      <textarea
        value={prescribedMedications}
        onChange={(e) => onPrescribedMedicationsChange(e.target.value)}
        rows={2}
        disabled={!isClinicalEditable}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none disabled:bg-gray-50 disabled:text-gray-500"
        placeholder="Medicamentos receitados..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <span className="flex items-center gap-1">
          <Home size={14} /> Cuidados domiciliares
        </span>
      </label>
      <textarea
        value={homeCareRecommendations}
        onChange={(e) => onHomeCareRecommendationsChange(e.target.value)}
        rows={2}
        disabled={!isClinicalEditable}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none disabled:bg-gray-50 disabled:text-gray-500"
        placeholder="Orientações e cuidados em casa..."
      />
    </div>

    <div className="sm:w-1/3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <span className="flex items-center gap-1">
          <RotateCcw size={14} /> Retorno recomendado (dias)
        </span>
      </label>
      <input
        type="number"
        min={0}
        value={recommendedReturnDays}
        onChange={(e) => onRecommendedReturnDaysChange(e.target.value)}
        disabled={!isClinicalEditable}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
        placeholder="Ex.: 30"
      />
    </div>
  </div>
);

export default ClinicalEvolutionSection;
