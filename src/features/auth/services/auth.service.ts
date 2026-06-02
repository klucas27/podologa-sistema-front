import { api } from '@/lib/api';

export const authService = {
  register: (data: { username: string; password: string }) => api.post('/api/auth/register', data),
  getRegistrationStatus: async (): Promise<boolean> => {
    const res = await api.get<{ data: { enabled: boolean } }>('/api/auth/registration-status');
    return res.data.enabled;
  },
};
