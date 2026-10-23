import { api } from "@/lib/api";
import type { Appointment } from "@/types";

interface ApiResponse<T> {
  data: T;
}

export const bookingRequestService = {
  listPending: () =>
    api.get<ApiResponse<Appointment[]>>("/api/appointments/pending").then((res) => res.data),

  confirm: (id: string) =>
    api
      .post<ApiResponse<Appointment>>(`/api/appointments/${id}/transition`, { to: "scheduled" })
      .then((res) => res.data),

  decline: (id: string) =>
    api
      .post<ApiResponse<Appointment>>(`/api/appointments/${id}/transition`, { to: "cancelled" })
      .then((res) => res.data),
};
