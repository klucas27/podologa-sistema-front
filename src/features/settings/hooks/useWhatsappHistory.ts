import { useQuery } from '@tanstack/react-query';
import { whatsappService } from '../services/whatsapp.service';
import { whatsappKeys } from './useWhatsappStatus';
import type { WhatsappHistoryParams } from '../services/whatsapp.service';

export function useWhatsappHistory(params?: WhatsappHistoryParams) {
  return useQuery({
    queryKey: whatsappKeys.history({
      ...(params?.patientId ? { patientId: params.patientId } : {}),
      ...(params?.page !== undefined ? { page: String(params.page) } : {}),
      ...(params?.limit !== undefined ? { limit: String(params.limit) } : {}),
    }),
    queryFn: () => whatsappService.getHistory(params),
    select: (res) => res.data,
  });
}
