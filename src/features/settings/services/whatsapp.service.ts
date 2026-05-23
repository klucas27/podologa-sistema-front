import { api } from '@/lib/api';
import type { WhatsappMessage } from '@/types';

interface WhatsappStatusResponse {
  status: string;
  data: { configured: boolean };
}

interface WhatsappHistoryResponse {
  status: string;
  data: WhatsappMessage[];
}

export interface WhatsappHistoryParams {
  patientId?: string;
  page?: number;
  limit?: number;
}

export const whatsappService = {
  getStatus: () =>
    api.get<WhatsappStatusResponse>('/api/whatsapp/status'),

  getHistory: (params?: WhatsappHistoryParams) =>
    api.get<WhatsappHistoryResponse>('/api/whatsapp/history', {
      params: {
        ...(params?.patientId ? { patientId: params.patientId } : {}),
        ...(params?.page !== undefined ? { page: String(params.page) } : {}),
        ...(params?.limit !== undefined ? { limit: String(params.limit) } : {}),
      },
    }),
};
