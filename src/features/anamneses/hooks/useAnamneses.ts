import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { anamnesisService } from "../services/anamnesis.service";
import { notifySuccess } from "@/lib/notifications";
import type { Anamnesis } from "@/types";

export const anamnesisKeys = {
  all: ["anamneses"] as const,
  byPatient: (patientId: string) =>
    [...anamnesisKeys.all, "patient", patientId] as const,
};

export function useAnamnesesByPatient(patientId: string) {
  return useQuery({
    queryKey: anamnesisKeys.byPatient(patientId),
    queryFn: () => anamnesisService.getByPatientId(patientId),
    enabled: !!patientId,
  });
}

export function useCreateAnamnesis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: anamnesisService.create,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: anamnesisKeys.byPatient(variables.patientId),
      });
      notifySuccess("Anamnese salva com sucesso.");
    },
  });
}

export function useUpdateAnamnesis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof anamnesisService.update>[1];
      patientId: string;
    }) => anamnesisService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: anamnesisKeys.byPatient(variables.patientId),
      });
      notifySuccess("Anamnese atualizada com sucesso.");
    },
  });
}
