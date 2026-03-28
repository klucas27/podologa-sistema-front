import { api } from "@/lib/api";
import type { Billing, PaymentMethod } from "@/types";

interface ApiResponse<T> {
  data: T;
}

export interface CreateBillingData {
  appointmentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status?: "pending" | "paid";
}

export const billingService = {
  list: (params?: Record<string, string>) =>
    api
      .get<ApiResponse<Billing[]>>("/api/billings", params ? { params } : undefined)
      .then((res) => res.data),

  getById: (id: string) =>
    api
      .get<ApiResponse<Billing>>(`/api/billings/${id}`)
      .then((res) => res.data),

  getByAppointment: (appointmentId: string) =>
    api
      .get<ApiResponse<Billing[]>>(`/api/billings/appointment/${appointmentId}`)
      .then((res) => res.data),

  create: (data: CreateBillingData) =>
    api
      .post<ApiResponse<Billing>>("/api/billings", data)
      .then((res) => res.data),

  update: (id: string, data: Partial<CreateBillingData>) =>
    api
      .patch<ApiResponse<Billing>>(`/api/billings/${id}`, data)
      .then((res) => res.data),

  updateStatus: (id: string, status: string, paidAt?: string | null) =>
    api
      .patch<ApiResponse<Billing>>(`/api/billings/${id}`, { status, paidAt: paidAt ?? null })
      .then((res) => res.data),

  delete: (id: string) => api.delete<void>(`/api/billings/${id}`),
};
