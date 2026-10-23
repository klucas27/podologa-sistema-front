import { api } from "@/lib/api";
import type { UserRole } from "@/types";

interface ApiResponse<T> {
  data: T;
}

export type StaffRole = Exclude<UserRole, "admin">;

export interface ManagedUser {
  id: string;
  username: string;
  role: UserRole;
  professionalId: string | null;
  professionalName: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface CreateUserInput {
  username: string;
  password: string;
  role: StaffRole;
  professionalId: string | null;
}

export interface UpdateUserInput {
  role?: StaffRole;
  professionalId?: string | null;
  isActive?: boolean;
}

export const userService = {
  list: () => api.get<ApiResponse<ManagedUser[]>>("/api/users").then((res) => res.data),
  create: (data: CreateUserInput) => api.post<ApiResponse<ManagedUser>>("/api/users", data).then((res) => res.data),
  update: (id: string, data: UpdateUserInput) =>
    api.patch<ApiResponse<ManagedUser>>(`/api/users/${id}`, data).then((res) => res.data),
  resetPassword: (id: string, temporaryPassword: string) =>
    api.post<unknown>(`/api/users/${id}/reset-password`, { temporaryPassword }),
  remove: (id: string) => api.delete<unknown>(`/api/users/${id}`),
};
