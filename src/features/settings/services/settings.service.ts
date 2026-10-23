import { api } from '@/lib/api';
import type { BusinessSettings, ScheduleBlock, WorkingHours } from '@/types';

export interface ScheduleBlockInput {
  professionalId: string | null;
  startAt: string; // YYYY-MM-DDTHH:mm
  endAt: string;
  reason: string | null;
}

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

  getBusiness: () =>
    api.get<ApiResponse<BusinessSettings>>('/api/settings/business').then((res) => res.data),

  listBlocks: (from: string, to: string) =>
    api.get<ApiResponse<ScheduleBlock[]>>('/api/schedule-blocks', { params: { from, to } }).then((res) => res.data),

  createBlock: (data: ScheduleBlockInput) =>
    api.post<ApiResponse<ScheduleBlock>>('/api/schedule-blocks', data).then((res) => res.data),

  deleteBlock: (id: string) => api.delete<unknown>(`/api/schedule-blocks/${id}`),

  updateBusiness: (data: BusinessSettings) =>
    api.put<ApiResponse<BusinessSettings>>('/api/settings/business', data).then((res) => res.data),
};
