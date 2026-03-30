import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientProfessionalService } from "../services/patientProfessional.service";
import { notifySuccess } from "@/lib/notifications";

export const patientProfessionalKeys = {
  all: ["patientProfessionals"] as const,
  byPatient: (patientId: string) => [...patientProfessionalKeys.all, patientId] as const,
};

export function usePatientProfessionals(patientId: string) {
  return useQuery({
    queryKey: patientProfessionalKeys.byPatient(patientId),
    queryFn: () => patientProfessionalService.list(patientId),
    enabled: !!patientId,
  });
}

export function useReplacePatientProfessionals(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (professionalIds: string[]) =>
      patientProfessionalService.replaceAll(patientId, professionalIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientProfessionalKeys.byPatient(patientId) });
      notifySuccess("Profissionais atualizados.");
    },
  });
}
