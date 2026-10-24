import { api } from "@/lib/api";

interface ApiResponse<T> {
  data: T;
}

export type ReferralStatus = "pending" | "scheduled" | "completed" | "declined";

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  fromProfessionalId: string;
  fromProfessionalName: string;
  toProfessionalId: string | null;
  toProfessionalName: string | null;
  sourceAppointmentId: string;
  resultingAppointmentId: string | null;
  reason: string;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferralInput {
  sourceAppointmentId: string;
  reason: string;
  toProfessionalId?: string | null;
}

export const referralService = {
  list: (status?: ReferralStatus) =>
    api.get<ApiResponse<Referral[]>>("/api/referrals", status ? { params: { status } } : undefined).then((res) => res.data),

  create: (data: CreateReferralInput) => api.post<ApiResponse<Referral>>("/api/referrals", data).then((res) => res.data),

  decline: (id: string) => api.post<ApiResponse<Referral>>(`/api/referrals/${id}/decline`, {}).then((res) => res.data),
};
