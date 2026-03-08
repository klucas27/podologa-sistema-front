export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'other';

export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string | null;
  maritalStatus: MaritalStatus;
  occupation: string | null;
  cpf: string;
  phoneNumber: string | null;
  email: string | null;
  zipCode: string | null;
  street: string | null;
  addressNumber: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Perfusion = 'normal' | 'pale' | 'cyanotic' | 'edematous';
export type PainSensitivity = 'high' | 'moderate' | 'low' | 'none';

export interface Anamnesis {
  id: string;
  patientId: string;
  frequentlyUsedFootwear: string | null;
  frequentlyUsedSocks: string | null;
  practicedSports: string | null;
  hasLowerLimbSurgery: boolean;
  lowerLimbSurgeryDetails: string | null;
  medicationsInUse: string | null;
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
  dermatologicalPathologies: string | null;
  nailPathologies: string | null;
  otherObservations: string | null;
  painSensitivity: PainSensitivity | null;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  patientId: string;
  userId: string;
  scheduledStart: string;
  scheduledEnd: string;
  scheduledDate: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  user?: { id: string; username: string; professionalName: string | null };
  clinicalEvolutions?: ClinicalEvolution[];
}

export type BodyPart = 'right_foot' | 'left_foot' | 'right_hand' | 'left_hand';

export interface Pathology {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvolutionPathology {
  evolutionId: string;
  pathologyId: string;
  bodyPart: BodyPart;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  pathology?: Pathology;
}

export interface ClinicalEvolution {
  id: string;
  appointmentId: string;
  clinicalNotes: string | null;
  prescribedMedications: string | null;
  homeCareRecommendations: string | null;
  recommendedReturnDays: number | null;
  createdAt: string;
  updatedAt: string;
  evolutionPathologies?: EvolutionPathology[];
}
