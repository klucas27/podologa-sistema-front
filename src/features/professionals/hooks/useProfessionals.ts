import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalService } from "../services/professional.service";

export const professionalKeys = {
  all: ["professionals"] as const,
  list: () => [...professionalKeys.all, "list"] as const,
  detail: (id: string) => [...professionalKeys.all, "detail", id] as const,
};

export function useProfessionals() {
  return useQuery({
    queryKey: professionalKeys.list(),
    queryFn: () => professionalService.list(),
  });
}

export function useCreateProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: professionalService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.all });
    },
  });
}

export function useUpdateProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof professionalService.update>[1];
    }) => professionalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.all });
    },
  });
}

export function useDeleteProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: professionalService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.all });
    },
  });
}
