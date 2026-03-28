import { api } from "@/lib/api";
import type {
  Appointment,
  ClinicalEvolution,
  Pathology,
  Billing,
  AppointmentStatus,
  PaymentMethod,
} from "@/types";

interface ApiResponse<T> {
  data: T;
}

export interface SaveEvolutionData {
  appointmentId: string;
  clinicalNotes: string;
  prescribedMedications: string;
  homeCareRecommendations: string;
  recommendedReturnDays: number | null;
  pathologies: Array<{
    pathologyId: string;
    bodyPart: string;
    notes: string;
  }>;
}

export interface SaveBillingData {
  appointmentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: "pending" | "paid";
}

export const consultationService = {
  getAppointment: (id: string) =>
    api
      .get<ApiResponse<Appointment>>(`/api/appointments/${id}`)
      .then((res) => res.data),

  updateAppointmentStatus: (id: string, status: AppointmentStatus) =>
    api
      .patch<ApiResponse<Appointment>>(`/api/appointments/${id}`, { status })
      .then((res) => res.data),

  updateAppointmentTimes: (
    id: string,
    scheduledStart: string,
    scheduledEnd: string,
  ) =>
    api
      .patch<ApiResponse<Appointment>>(`/api/appointments/${id}`, {
        scheduledStart,
        scheduledEnd,
      })
      .then((res) => res.data),

  listPathologies: () =>
    api
      .get<ApiResponse<Pathology[]>>("/api/pathologies")
      .then((res) => res.data),

  getEvolutions: (appointmentId: string) =>
    api
      .get<ApiResponse<ClinicalEvolution[]>>(
        `/api/clinical-evolutions/appointment/${appointmentId}`,
      )
      .then((res) => res.data),

  createEvolution: (data: SaveEvolutionData) =>
    api
      .post<ApiResponse<ClinicalEvolution>>("/api/clinical-evolutions", data)
      .then((res) => res.data),

  updateEvolution: (id: string, data: SaveEvolutionData) =>
    api
      .put<ApiResponse<ClinicalEvolution>>(`/api/clinical-evolutions/${id}`, data)
      .then((res) => res.data),

  getBillings: (appointmentId: string) =>
    api
      .get<ApiResponse<Billing[]>>(
        `/api/billings/appointment/${appointmentId}`,
      )
      .then((res) => res.data),

  createBilling: (data: SaveBillingData) =>
    api
      .post<ApiResponse<Billing>>("/api/billings", data)
      .then((res) => res.data),

  updateBilling: (id: string, data: Partial<SaveBillingData>) =>
    api
      .put<ApiResponse<Billing>>(`/api/billings/${id}`, data)
      .then((res) => res.data),

  deleteAppointment: (id: string) => api.delete(`/api/appointments/${id}`),

  createEvolutionPathology: (data: {
    evolutionId: string;
    pathologyId: string;
    bodyPart: string;
    notes: string | null;
  }) => api.post("/api/evolution-pathologies", data),

  deleteEvolutionPathology: (
    evolutionId: string,
    pathologyId: string,
    bodyPart: string,
  ) =>
    api.delete(
      `/api/evolution-pathologies/${evolutionId}/${pathologyId}/${bodyPart}`,
    ),
};
