import { useQuery } from '@tanstack/react-query';
import { whatsappService } from '../services/whatsapp.service';

export const whatsappKeys = {
  all: ['whatsapp'] as const,
  status: () => [...whatsappKeys.all, 'status'] as const,
  history: (params?: Record<string, string>) =>
    [...whatsappKeys.all, 'history', params] as const,
};

export function useWhatsappStatus() {
  return useQuery({
    queryKey: whatsappKeys.status(),
    queryFn: () => whatsappService.getStatus(),
    select: (res) => res.data,
  });
}
