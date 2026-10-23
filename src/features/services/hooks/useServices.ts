import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceService } from "../services/service.service";
import type { ServiceInput } from "../services/service.service";
import { notifySuccess } from "@/lib/notifications";

export const serviceKeys = {
  all: ["services"] as const,
  list: () => [...serviceKeys.all, "list"] as const,
  active: () => [...serviceKeys.all, "active"] as const,
  byProfessional: (professionalId: string) => [...serviceKeys.all, "professional", professionalId] as const,
};

export function useServices() {
  return useQuery({ queryKey: serviceKeys.list(), queryFn: () => serviceService.list() });
}

export function useActiveServices() {
  return useQuery({ queryKey: serviceKeys.active(), queryFn: () => serviceService.listActive() });
}

export function useProfessionalServices(professionalId: string | null) {
  return useQuery({
    queryKey: serviceKeys.byProfessional(professionalId ?? ""),
    queryFn: () => serviceService.listByProfessional(professionalId ?? ""),
    enabled: !!professionalId,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ServiceInput) => serviceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      notifySuccess("Serviço cadastrado.");
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceInput> }) => serviceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      notifySuccess("Serviço atualizado.");
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      notifySuccess("Serviço removido.");
    },
  });
}

export function useSetProfessionalServices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ professionalId, serviceIds }: { professionalId: string; serviceIds: string[] }) =>
      serviceService.setProfessionalServices(professionalId, serviceIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}
