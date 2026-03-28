import type { Perfusion, PainSensitivity } from '@/types';

export interface AnamnesisForm {
  frequentlyUsedFootwear: string;
  frequentlyUsedSocks: string;
  practicedSports: string;
  hasLowerLimbSurgery: boolean;
  lowerLimbSurgeryDetails: string;
  medicationsInUse: string;
  isPregnant: boolean;
  hasPacemakerOrPins: boolean;
  hasHypertension: boolean;
  hasSeizures: boolean;
  hasCancerHistory: boolean;
  hasDiabetes: boolean;
  hasCirculatoryProblems: boolean;
  hasHealingProblems: boolean;
  perfusion: Perfusion;
  hasMonofilamentSensitivity: boolean;
  dermatologicalPathologies: string;
  nailPathologies: string;
  otherObservations: string;
  painSensitivity: PainSensitivity;
}

export const INITIAL_FORM: AnamnesisForm = {
  frequentlyUsedFootwear: '',
  frequentlyUsedSocks: '',
  practicedSports: '',
  hasLowerLimbSurgery: false,
  lowerLimbSurgeryDetails: '',
  medicationsInUse: '',
  isPregnant: false,
  hasPacemakerOrPins: false,
  hasHypertension: false,
  hasSeizures: false,
  hasCancerHistory: false,
  hasDiabetes: false,
  hasCirculatoryProblems: false,
  hasHealingProblems: false,
  perfusion: 'normal',
  hasMonofilamentSensitivity: true,
  dermatologicalPathologies: '',
  nailPathologies: '',
  otherObservations: '',
  painSensitivity: 'none',
};

export const PERFUSION_OPTIONS: { value: Perfusion; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'pale', label: 'Pálida' },
  { value: 'cyanotic', label: 'Cianótica' },
  { value: 'edematous', label: 'Edematosa' },
];

export const PAIN_SENSITIVITY_OPTIONS: { value: PainSensitivity; label: string }[] = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'low', label: 'Baixa' },
  { value: 'moderate', label: 'Moderada' },
  { value: 'high', label: 'Alta' },
];

export const MEDICAL_HISTORY_FIELDS = [
  { name: 'hasHypertension', label: 'Hipertensão' },
  { name: 'hasSeizures', label: 'Convulsões' },
  { name: 'hasDiabetes', label: 'Diabetes' },
  { name: 'hasCancerHistory', label: 'Histórico de câncer' },
  { name: 'hasCirculatoryProblems', label: 'Problemas circulatórios' },
  { name: 'hasPacemakerOrPins', label: 'Marcapasso ou pinos' },
  { name: 'hasHealingProblems', label: 'Problemas de cicatrização' },
  { name: 'isPregnant', label: 'Gestante' },
  { name: 'hasLowerLimbSurgery', label: 'Cirurgia em membros inferiores' },
] as const;

export const INPUT_CLASS =
  'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition';
