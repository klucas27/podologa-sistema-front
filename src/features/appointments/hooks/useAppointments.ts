/**
 * React Query hooks para Agendamentos.
 *
 * Optimistic update no useUpdateAppointment:
 * Essencial para drag-and-drop no calendário — o appointment move
 * visualmente no instante do drop, sem esperar a response do servidor.
 * Se o servidor rejeitar (conflito de horário, etc.), faz rollback.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "../services/appointment.service";
import { notifySuccess } from "@/lib/notifications";
import type { CreateAppointmentData } from "../services/appointment.service";
import type { Appointment } from "@/types";

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (params?: Record<string, string>) =>
    [...appointmentKeys.all, "list", params] as const,
  detail: (id: string) => [...appointmentKeys.all, "detail", id] as const,
  byPatient: (patientId: string) =>
    [...appointmentKeys.all, "patient", patientId] as const,
};

export function useAppointments(params?: Record<string, string>) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => appointmentService.list(params),
  });
}

export function useAppointmentsByPatient(patientId: string) {
  return useQuery({
    queryKey: appointmentKeys.byPatient(patientId),
    queryFn: () => appointmentService.listByPatient(patientId),
    enabled: !!patientId,
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
      notifySuccess("Agendamento criado com sucesso.");
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

    // Optimistic update — crítico para drag-and-drop no calendário
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: appointmentKeys.all });

      const previousLists = queryClient.getQueriesData<Appointment[]>({
        queryKey: appointmentKeys.all,
      });

      // Atualiza todas as listas de appointments otimisticamente
      queryClient.setQueriesData<Appointment[]>(
        { queryKey: appointmentKeys.all },
        (old) =>
          old?.map((appt) =>
            appt.id === id ? { ...appt, ...data } : appt,
          ),
      );

      return { previousLists };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousLists) {
        for (const [queryKey, data] of context.previousLists) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    onSettled: () => {
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
      notifySuccess("Agendamento excluído.");
    },
  });
}
