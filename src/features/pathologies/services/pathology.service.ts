import { api } from "@/lib/api";
import type { Pathology } from "@/types";

interface ApiResponse<T> {
  data: T;
}

export const pathologyService = {
  list: () =>
    api
      .get<ApiResponse<Pathology[]>>("/api/pathologies")
      .then((res) => res.data),

  getById: (id: string) =>
    api
      .get<ApiResponse<Pathology>>(`/api/pathologies/${id}`)
      .then((res) => res.data),

  create: (data: { name: string; description?: string }) =>
    api
      .post<ApiResponse<Pathology>>("/api/pathologies", data)
      .then((res) => res.data),

  update: (id: string, data: { name: string; description?: string }) =>
    api
      .patch<ApiResponse<Pathology>>(`/api/pathologies/${id}`, data)
      .then((res) => res.data),

  delete: (id: string) => api.delete<void>(`/api/pathologies/${id}`),
};
