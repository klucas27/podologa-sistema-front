import { api } from '@/lib/api';

export const authService = {
  register: (data: { username: string; password: string }) =>
    api.post('/api/auth/register', data),
};
