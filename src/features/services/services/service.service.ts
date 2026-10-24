import { api } from "@/lib/api";
import type { CommissionMode, Service, ServiceCategory } from "@/types";

interface ApiResponse<T> {
  data: T;
}

export interface ServiceInput {
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  commissionRate: number | null;
  commissionMode: CommissionMode;
  commissionFixed: number | null;
  requiresAnamnesis: boolean;
  isPublic: boolean;
  isActive?: boolean;
}

/** Item da ficha técnica: produto consumido a cada atendimento do serviço. */
export interface ServiceProduct {
  productId: string;
  name: string;
  unit: string;
  quantity: number;
}

export const serviceService = {
  listProducts: (id: string) => api.get<ApiResponse<ServiceProduct[]>>(`/api/services/${id}/products`).then((res) => res.data),

  setProducts: (id: string, items: { productId: string; quantity: number }[]) =>
    api.put<ApiResponse<ServiceProduct[]>>(`/api/services/${id}/products`, { items }).then((res) => res.data),

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
