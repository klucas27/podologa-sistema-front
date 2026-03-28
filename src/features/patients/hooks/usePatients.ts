import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../services/patient.service";

export const patientKeys = {
  all: ["patients"] as const,
  list: (search?: string) => [...patientKeys.all, "list", search] as const,
  detail: (id: string) => [...patientKeys.all, "detail", id] as const,
};

export function usePatients(search?: string) {
  return useQuery({
    queryKey: patientKeys.list(search),
    queryFn: () => patientService.list(search),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof patientService.update>[1] }) =>
      patientService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
    },
  });
}

export function useForceDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientService.forceDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
    },
  });
}
