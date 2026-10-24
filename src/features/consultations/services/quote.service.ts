import { api } from "@/lib/api";

interface ApiResponse<T> {
  data: T;
}

export type QuoteStatus = "pending" | "accepted" | "declined";

export interface Quote {
  id: string;
  appointmentId: string;
  amount: number;
  description: string | null;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteInput {
  amount: number;
  description: string | null;
  status: QuoteStatus;
}

export const quoteService = {
  getByAppointment: (appointmentId: string) =>
    api.get<ApiResponse<Quote | null>>(`/api/quotes/appointment/${appointmentId}`).then((res) => res.data),

  create: (appointmentId: string, data: QuoteInput) =>
    api.post<ApiResponse<Quote>>("/api/quotes", { appointmentId, ...data }).then((res) => res.data),

  update: (id: string, data: QuoteInput) => api.patch<ApiResponse<Quote>>(`/api/quotes/${id}`, data).then((res) => res.data),
};
