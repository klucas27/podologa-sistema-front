export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'other';
export type AcquisitionSource = 'instagram' | 'indicacao' | 'google' | 'passagem' | 'link' | 'outro';
export type ProfessionalType = 'manicure' | 'podologa';
export type ServiceCategory = 'estetica' | 'podologia';
export type AppointmentSource = 'link' | 'whatsapp' | 'instagram' | 'indicacao' | 'balcao';

export interface PatientProfessionalLink {
  patientId: string;
  professionalId: string;
  professional?: { id: string; fullName: string };
}

export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string | null;
  maritalStatus: MaritalStatus;
  occupation: string | null;
  cpf: string | null;
  phoneNumber: string | null;
  phoneNormalized: string | null;
  instagram: string | null;
  acquisitionSource: AcquisitionSource | null;
  referredByPatientId: string | null;
  lgpdConsentAt: string | null;
  imageConsentAt: string | null;
  consentVersion: string | null;
  email: string | null;
  zipCode: string | null;
  street: string | null;
  addressNumber: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { anamneses: number };
  anamneses?: Anamnesis[];
  patientProfessionals?: PatientProfessionalLink[];
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

export type AppointmentStatus =
  | 'pending'
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Professional {
  id: string;
  fullName: string;
  type: ProfessionalType;
  commissionRate: number | null;
  acceptsOnlineBooking: boolean;
  specialty: string | null;
  phoneNumber: string | null;
  email: string | null;
  isActive: boolean;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  userId: string;
  professionalId: string;
  serviceId: string | null;
  priceCharged: number | null;
  source: AppointmentSource;
  confirmedAt: string | null;
  cancelledAt: string | null;
  rescheduledFromId: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  scheduledDate: string;
  actualStartTime: string | null;
  actualEndTime: string | null;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  user?: { id: string; username: string; professionalName: string | null };
  professional?: Professional;
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

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer' | 'other';
export type BillingStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface Billing {
  id: string;
  appointmentId: string;
  amount: string;
  paymentMethod: PaymentMethod;
  status: BillingStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  appointment?: Appointment;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  commissionRate: number | null;
  requiresAnamnesis: boolean;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface BusinessSettings {
  businessName: string;
  slug: string;
  address: string | null;
  phoneDisplay: string | null;
  onlineBookingEnabled: boolean;
  autoConfirmOnlineBooking: boolean;
  minAdvanceMinutes: number;
  maxAdvanceDays: number;
  slotStepMinutes: number;
  minCancelHours: number;
  maxPendingPerPhone: number;
  consentText: string;
  consentVersion: string;
}

export interface ScheduleBlock {
  id: string;
  professionalId: string | null;
  startAt: string;
  endAt: string;
  reason: string | null;
}
