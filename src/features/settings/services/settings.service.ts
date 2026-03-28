import { api } from '@/lib/api';

export const settingsService = {
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/api/auth/password', data),

  updateWorkingHours: (data: { workdayStart: string; workdayEnd: string }) =>
    api.patch('/api/auth/working-hours', data),
};
