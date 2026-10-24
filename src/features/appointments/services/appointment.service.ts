import { api } from "@/lib/api";
import type { Appointment, AppointmentSource, AppointmentStatus } from "@/types";

interface ApiResponse<T> {
  data: T;
}

/** Fim, data e preço são calculados no servidor a partir do serviço. */
export interface CreateAppointmentData {
  patientId: string;
  professionalId: string;
  serviceId: string;
  scheduledStart: string;
  source?: AppointmentSource;
  notes?: string;
  /** Encaminhamento manicure → podóloga que este agendamento atende. */
  referralId?: string;
}

export const appointmentService = {
  list: (params?: Record<string, string>) =>
    api
      .get<ApiResponse<Appointment[]>>("/api/appointments", params ? { params } : undefined)
      .then((res) => res.data),

  getById: (id: string) =>
    api
      .get<ApiResponse<Appointment>>(`/api/appointments/${id}`)
      .then((res) => res.data),

  create: (data: CreateAppointmentData) =>
    api
      .post<ApiResponse<Appointment>>("/api/appointments", data)
      .then((res) => res.data),

  update: (id: string, data: Partial<Appointment>) =>
    api
      .patch<ApiResponse<Appointment>>(`/api/appointments/${id}`, data)
      .then((res) => res.data),

  updateStatus: (id: string, status: AppointmentStatus) =>
    api
      .patch<ApiResponse<Appointment>>(`/api/appointments/${id}`, { status })
      .then((res) => res.data),

  delete: (id: string) => api.delete<void>(`/api/appointments/${id}`),

  listByPatient: (patientId: string) =>
    api
      .get<ApiResponse<Appointment[]>>(`/api/appointments/patient/${patientId}`)
      .then((res) => res.data),
};
