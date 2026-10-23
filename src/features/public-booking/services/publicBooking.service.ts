import { publicApi } from '@/lib/publicApi';

export interface PublicService {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
}

export interface PublicProfessional {
  id: string;
  firstName: string;
  serviceIds: string[];
}

export interface PublicSalonInfo {
  businessName: string;
  address: string | null;
  phoneDisplay: string | null;
  consentText: string;
  consentVersion: string;
  services: PublicService[];
  professionals: PublicProfessional[];
}

export interface IdentifyResponse {
  registered: boolean;
  firstName?: string;
}

export interface RegisterInput {
  fullName: string;
  dateOfBirth?: string;
  lgpdConsent: true;
  imageConsent?: boolean;
  website: string;
}

const base = (slug: string) => `/api/public/${encodeURIComponent(slug)}`;

export const publicBookingService = {
  info: (slug: string) => publicApi.get<PublicSalonInfo>(`${base(slug)}/info`),
  identify: (slug: string, phone: string) =>
    publicApi.post<IdentifyResponse>(`${base(slug)}/identify`, { phone, website: '' }),
  register: (slug: string, input: RegisterInput) =>
    publicApi.post<{ firstName: string }>(`${base(slug)}/register`, input),
};
