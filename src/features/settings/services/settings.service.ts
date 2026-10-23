import { api } from '@/lib/api';
import type { WorkingHours } from '@/types';

interface ApiResponse<T> {
  data: T;
}

export const settingsService = {
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/api/auth/password', data),

  getWorkingHours: (professionalId: string) =>
    api
      .get<ApiResponse<WorkingHours[]>>(`/api/professionals/${professionalId}/working-hours`)
      .then((res) => res.data),

  setWorkingHours: (professionalId: string, days: WorkingHours[]) =>
    api
      .put<ApiResponse<WorkingHours[]>>(`/api/professionals/${professionalId}/working-hours`, { days })
      .then((res) => res.data),
};
