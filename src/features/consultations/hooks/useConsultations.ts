import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { consultationService } from "../services/consultation.service";
import type { SaveEvolutionData, SaveBillingData } from "../services/consultation.service";

export const consultationKeys = {
  all: ["consultations"] as const,
  appointment: (id: string) =>
    [...consultationKeys.all, "appointment", id] as const,
  evolutions: (appointmentId: string) =>
    [...consultationKeys.all, "evolutions", appointmentId] as const,
  billings: (appointmentId: string) =>
    [...consultationKeys.all, "billings", appointmentId] as const,
  pathologies: ["pathologies"] as const,
};

export function useConsultationAppointment(appointmentId: string) {
  return useQuery({
    queryKey: consultationKeys.appointment(appointmentId),
    queryFn: () => consultationService.getAppointment(appointmentId),
    enabled: !!appointmentId,
  });
}

export function useConsultationEvolutions(appointmentId: string) {
  return useQuery({
    queryKey: consultationKeys.evolutions(appointmentId),
    queryFn: () => consultationService.getEvolutions(appointmentId),
    enabled: !!appointmentId,
  });
}

export function useConsultationBillings(appointmentId: string) {
  return useQuery({
    queryKey: consultationKeys.billings(appointmentId),
    queryFn: () => consultationService.getBillings(appointmentId),
    enabled: !!appointmentId,
  });
}

export function usePathologiesList() {
  return useQuery({
    queryKey: consultationKeys.pathologies,
    queryFn: () => consultationService.listPathologies(),
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Parameters<typeof consultationService.updateAppointmentStatus>[1] }) =>
      consultationService.updateAppointmentStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.appointment(variables.id),
      });
    },
  });
}

export function useUpdateAppointmentTimes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      scheduledStart,
      scheduledEnd,
    }: {
      id: string;
      scheduledStart: string;
      scheduledEnd: string;
    }) =>
      consultationService.updateAppointmentTimes(id, scheduledStart, scheduledEnd),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.appointment(variables.id),
      });
    },
  });
}

export function useSaveEvolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id?: string;
      data: SaveEvolutionData;
    }) =>
      id
        ? consultationService.updateEvolution(id, data)
        : consultationService.createEvolution(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.evolutions(variables.data.appointmentId),
      });
    },
  });
}

export function useSaveBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id?: string;
      data: SaveBillingData;
    }) =>
      id
        ? consultationService.updateBilling(id, data)
        : consultationService.createBilling(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.billings(variables.data.appointmentId),
      });
    },
  });
}
