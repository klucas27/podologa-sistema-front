import { api } from "@/lib/api";
import type { Professional } from "@/types";

interface ApiResponse<T> {
  data: T;
}

export const professionalService = {
  list: () =>
    api
      .get<ApiResponse<Professional[]>>("/api/professionals")
      .then((res) => res.data),

  getById: (id: string) =>
    api
      .get<ApiResponse<Professional>>(`/api/professionals/${id}`)
      .then((res) => res.data),

  create: (data: Partial<Professional>) =>
    api
      .post<ApiResponse<Professional>>("/api/professionals", data)
      .then((res) => res.data),

  update: (id: string, data: Partial<Professional>) =>
    api
      .patch<ApiResponse<Professional>>(`/api/professionals/${id}`, data)
      .then((res) => res.data),

  listActive: () =>
    api
      .get<ApiResponse<Professional[]>>("/api/professionals/active")
      .then((res) => res.data),

  delete: (id: string) => api.delete<void>(`/api/professionals/${id}`),
};
