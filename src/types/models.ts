export interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  birthDate: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado';
  procedure: string;
  notes?: string;
  createdAt: string;
}
