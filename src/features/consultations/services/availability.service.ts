import { api } from "@/lib/api";

interface ApiResponse<T> {
  data: T;
}

export interface AvailabilitySlot {
  start: string;
  professionalIds: string[];
}

export interface AvailabilityDay {
  date: string;
  slots: AvailabilitySlot[];
}

export interface AvailabilityParams {
  serviceId: string;
  professionalId: string;
  from: string;
  to: string;
}

export const availabilityService = {
  getAvailability: (params: AvailabilityParams) =>
    api
      .get<ApiResponse<{ days: AvailabilityDay[] }>>("/api/availability", {
        params: {
          serviceId: params.serviceId,
          professionalId: params.professionalId,
          from: params.from,
          to: params.to,
        },
      })
      .then((res) => res.data),
};
