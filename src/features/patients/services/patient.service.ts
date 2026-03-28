import { api } from "@/lib/api";
import type { Patient } from "@/types";

interface ApiResponse<T> {
  data: T;
}

export const patientService = {
  list: (search?: string) => {
    const params = search ? { params: { search } } : undefined;
    return api
      .get<ApiResponse<Patient[]>>("/api/patients", params)
      .then((res) => res.data);
  },

  getById: (id: string) =>
    api.get<ApiResponse<Patient>>(`/api/patients/${id}`).then((res) => res.data),

  create: (data: Partial<Patient>) =>
    api
      .post<ApiResponse<Patient>>("/api/patients", data)
      .then((res) => res.data),

  update: (id: string, data: Partial<Patient>) =>
    api
      .patch<ApiResponse<Patient>>(`/api/patients/${id}`, data)
      .then((res) => res.data),

  delete: (id: string) => api.delete<void>(`/api/patients/${id}`),

  forceDelete: (id: string) => api.delete<void>(`/api/patients/${id}/force`),
};
