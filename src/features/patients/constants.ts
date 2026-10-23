import type { MaritalStatus, Perfusion, PainSensitivity, BodyPart, AcquisitionSource } from "@/types";

export const MARITAL_LABELS: Record<MaritalStatus, string> = {
  single: "Solteiro(a)",
  married: "Casado(a)",
  divorced: "Divorciado(a)",
  widowed: "Viúvo(a)",
  other: "Outro",
};

export const PERFUSION_LABELS: Record<Perfusion, string> = {
  normal: "Normal",
  pale: "Pálida",
  cyanotic: "Cianótica",
  edematous: "Edematosa",
};

export const PAIN_LABELS: Record<PainSensitivity, string> = {
  none: "Nenhuma",
  low: "Baixa",
  moderate: "Moderada",
  high: "Alta",
};

export const BODY_PART_LABELS: Record<BodyPart, string> = {
  right_foot: "Pé direito",
  left_foot: "Pé esquerdo",
  right_hand: "Mão direita",
  left_hand: "Mão esquerda",
};

export const STATUS_LABELS: Record<
  string,
  { label: string; className: string }
> = {
  pending: { label: "Pedido pelo link", className: "bg-amber-50 text-amber-700" },
  no_show: { label: "Faltou", className: "bg-red-50 text-red-700" },
  scheduled: { label: "Agendada", className: "bg-blue-50 text-blue-700" },
  confirmed: {
    label: "Confirmada",
    className: "bg-indigo-50 text-indigo-700",
  },
  in_progress: {
    label: "Em atendimento",
    className: "bg-yellow-50 text-yellow-700",
  },
  completed: { label: "Concluída", className: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelada", className: "bg-gray-100 text-gray-500" },
};

export const formatCpf = (cpf: string) => {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.***.***-${d.slice(9)}`;
};

export const formatPhone = (phone: string | null) => {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  if (d.length === 11)
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
};

export { formatDate, formatTime } from "@/lib/dateUtils";

/* ─── Patient form types & constants (shared by Cadastro/Editar) ─── */

export interface PatientForm {
  fullName: string;
  dateOfBirth: string;
  maritalStatus: MaritalStatus;
  occupation: string;
  cpf: string;
  phoneNumber: string;
  email: string;
  zipCode: string;
  street: string;
  addressNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  instagram: string;
  acquisitionSource: AcquisitionSource | '';
  lgpdConsent: boolean;
  imageConsent: boolean;
  professionalIds: string[];
}

export const ACQUISITION_OPTIONS: { value: AcquisitionSource; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'google', label: 'Google' },
  { value: 'passagem', label: 'Passou na frente' },
  { value: 'link', label: 'Link de agendamento' },
  { value: 'outro', label: 'Outro' },
];

export const INITIAL_PATIENT_FORM: PatientForm = {
  fullName: '',
  dateOfBirth: '',
  maritalStatus: 'other',
  occupation: '',
  cpf: '',
  phoneNumber: '',
  email: '',
  zipCode: '',
  street: '',
  addressNumber: '',
  neighborhood: '',
  city: '',
  state: '',
  instagram: '',
  acquisitionSource: '',
  lgpdConsent: false,
  imageConsent: false,
  professionalIds: [],
};

export const MARITAL_OPTIONS: { value: MaritalStatus; label: string }[] = [
  { value: 'single', label: 'Solteiro(a)' },
  { value: 'married', label: 'Casado(a)' },
  { value: 'divorced', label: 'Divorciado(a)' },
  { value: 'widowed', label: 'Viúvo(a)' },
  { value: 'other', label: 'Outro' },
];

export const BRAZILIAN_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export const INPUT_CLASS =
  'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition';

/** Campos enviados à API a partir do formulário (cadastro e edição). */
export function patientPayload(form: PatientForm): Record<string, unknown> {
  return {
    fullName: form.fullName.trim(),
    phoneNumber: form.phoneNumber,
    dateOfBirth: form.dateOfBirth || null,
    maritalStatus: form.maritalStatus,
    occupation: form.occupation || null,
    cpf: form.cpf.replace(/\D/g, '') || null,
    email: form.email || null,
    zipCode: form.zipCode || null,
    street: form.street || null,
    addressNumber: form.addressNumber || null,
    neighborhood: form.neighborhood || null,
    city: form.city || null,
    state: form.state || null,
    instagram: form.instagram.trim().replace(/^@/, '') || null,
    acquisitionSource: form.acquisitionSource || null,
    imageConsent: form.imageConsent,
  };
}
