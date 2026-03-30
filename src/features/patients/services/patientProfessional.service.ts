import { api } from "@/lib/api";
import type { PatientProfessionalLink } from "@/types";

interface ApiResponse<T> {
  data: T;
}

export const patientProfessionalService = {
  list: (patientId: string) =>
    api
      .get<ApiResponse<PatientProfessionalLink[]>>(`/api/patients/${patientId}/professionals`)
      .then((res) => res.data),

  link: (patientId: string, professionalId: string) =>
    api
      .post<ApiResponse<PatientProfessionalLink>>(`/api/patients/${patientId}/professionals`, { professionalId })
      .then((res) => res.data),

  unlink: (patientId: string, professionalId: string) =>
    api.delete<void>(`/api/patients/${patientId}/professionals/${professionalId}`),

  replaceAll: (patientId: string, professionalIds: string[]) =>
    api
      .put<ApiResponse<PatientProfessionalLink[]>>(`/api/patients/${patientId}/professionals`, { professionalIds })
      .then((res) => res.data),
};
