import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "../services/appointment.service";
import type { CreateAppointmentData } from "../services/appointment.service";

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (params?: Record<string, string>) =>
    [...appointmentKeys.all, "list", params] as const,
  detail: (id: string) => [...appointmentKeys.all, "detail", id] as const,
};

export function useAppointments(params?: Record<string, string>) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => appointmentService.list(params),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentService.getById(id),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentData) =>
      appointmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof appointmentService.update>[1];
    }) => appointmentService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}
