import { api } from "@/lib/api";
import type { Anamnesis } from "@/types";

interface ApiResponse<T> {
  data: T;
}

export const anamnesisService = {
  getByPatientId: (patientId: string) =>
    api
      .get<ApiResponse<Anamnesis[]>>(`/api/anamneses/patient/${patientId}`)
      .then((res) => res.data),

  create: (data: Partial<Anamnesis> & { patientId: string }) =>
    api
      .post<ApiResponse<Anamnesis>>("/api/anamneses", data)
      .then((res) => res.data),

  update: (id: string, data: Partial<Anamnesis>) =>
    api
      .patch<ApiResponse<Anamnesis>>(`/api/anamneses/${id}`, data)
      .then((res) => res.data),
};
