import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pathologyService } from "../services/pathology.service";

export const pathologyKeys = {
  all: ["pathologies"] as const,
  list: () => [...pathologyKeys.all, "list"] as const,
  detail: (id: string) => [...pathologyKeys.all, "detail", id] as const,
};

export function usePathologies() {
  return useQuery({
    queryKey: pathologyKeys.list(),
    queryFn: () => pathologyService.list(),
  });
}

export function useCreatePathology() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pathologyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pathologyKeys.all });
    },
  });
}

export function useUpdatePathology() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof pathologyService.update>[1];
    }) => pathologyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pathologyKeys.all });
    },
  });
}

export function useDeletePathology() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pathologyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pathologyKeys.all });
    },
  });
}
