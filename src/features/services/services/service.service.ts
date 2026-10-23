import { api } from "@/lib/api";
import type { Service, ServiceCategory } from "@/types";

interface ApiResponse<T> {
  data: T;
}

export interface ServiceInput {
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  commissionRate: number | null;
  requiresAnamnesis: boolean;
  isPublic: boolean;
  isActive?: boolean;
}

export const serviceService = {
  list: () => api.get<ApiResponse<Service[]>>("/api/services").then((res) => res.data),

  listActive: () => api.get<ApiResponse<Service[]>>("/api/services?active=true").then((res) => res.data),

  create: (data: ServiceInput) => api.post<ApiResponse<Service>>("/api/services", data).then((res) => res.data),

  update: (id: string, data: Partial<ServiceInput>) =>
    api.patch<ApiResponse<Service>>(`/api/services/${id}`, data).then((res) => res.data),

  delete: (id: string) => api.delete<unknown>(`/api/services/${id}`),

  listByProfessional: (professionalId: string) =>
    api.get<ApiResponse<Service[]>>(`/api/professionals/${professionalId}/services`).then((res) => res.data),

  setProfessionalServices: (professionalId: string, serviceIds: string[]) =>
    api
      .put<ApiResponse<Service[]>>(`/api/professionals/${professionalId}/services`, { serviceIds })
      .then((res) => res.data),
};
