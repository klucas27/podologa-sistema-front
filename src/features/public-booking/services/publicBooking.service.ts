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

export interface AvailabilityQuery {
  serviceId: string;
  professionalId?: string;
  from: string;
  to: string;
}

export interface AvailabilityDay {
  date: string;
  slots: string[];
}

export interface BookInput {
  serviceId: string;
  professionalId: string | null;
  start: string;
  website: '';
}

export interface BookedAppointment {
  bookingId: string;
  status: string;
  serviceName: string;
  professionalFirstName: string;
  start: string;
  end: string;
  address: string | null;
  manageToken: string;
}

/** Agendamento visto pelo link individual da cliente. */
export interface ManagedBooking {
  serviceName: string;
  professionalId: string;
  professionalFirstName: string;
  start: string;
  end: string;
  status: string;
  canChange: boolean;
  changeDeadline: string;
}

/** Link individual que a cliente guarda para cancelar ou remarcar. */
export const manageUrl = (slug: string, token: string) =>
  `${window.location.origin}/agendamento/${encodeURIComponent(slug)}/${encodeURIComponent(token)}`;

export const whatsappShareUrl = (url: string) =>
  `https://wa.me/?text=${encodeURIComponent(`Meu horário na Nálu Nails: ${url}`)}`;

const base = (slug: string) => `/api/public/${encodeURIComponent(slug)}`;
const manageBase = (slug: string, token: string) => `${base(slug)}/manage/${encodeURIComponent(token)}`;

export const publicBookingService = {
  info: (slug: string) => publicApi.get<PublicSalonInfo>(`${base(slug)}/info`),
  identify: (slug: string, phone: string) =>
    publicApi.post<IdentifyResponse>(`${base(slug)}/identify`, { phone, website: '' }),
  register: (slug: string, input: RegisterInput) =>
    publicApi.post<{ firstName: string }>(`${base(slug)}/register`, input),
  availability: (slug: string, query: AvailabilityQuery) => {
    const params = new URLSearchParams({ serviceId: query.serviceId, from: query.from, to: query.to });
    if (query.professionalId) params.set('professionalId', query.professionalId);
    return publicApi.get<{ days: AvailabilityDay[] }>(`${base(slug)}/availability?${params.toString()}`);
  },
  book: (slug: string, input: BookInput) =>
    publicApi.post<BookedAppointment>(`${base(slug)}/bookings`, input),
  manage: (slug: string, token: string) =>
    publicApi.get<ManagedBooking>(`${manageBase(slug, token)}`),
  cancel: (slug: string, token: string) =>
    publicApi.post<{ status: 'cancelled' }>(`${manageBase(slug, token)}/cancel`, {}),
  manageAvailability: (slug: string, token: string, query: Omit<AvailabilityQuery, 'serviceId'>) => {
    const params = new URLSearchParams({ from: query.from, to: query.to });
    if (query.professionalId) params.set('professionalId', query.professionalId);
    return publicApi.get<{ days: AvailabilityDay[] }>(`${manageBase(slug, token)}/availability?${params.toString()}`);
  },
  reschedule: (slug: string, token: string, input: { start: string; professionalId: string | null }) =>
    publicApi.post<ManagedBooking>(`${manageBase(slug, token)}/reschedule`, input),
};
