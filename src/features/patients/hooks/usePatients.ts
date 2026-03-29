/**
 * React Query hooks para Pacientes.
 *
 * Optimistic updates no useUpdatePatient:
 * ─────────────────────────────────────────
 * Antes da response do servidor, o cache é atualizado localmente.
 * Se o servidor retornar erro, o cache faz rollback para o snapshot
 * salvo em onMutate. Isso dá feedback instantâneo ao usuário.
 *
 * Alternativa descartada: aguardar response para atualizar UI
 * — Por quê: em edição de formulário, o delay de 200-500ms entre
 *   submit e feedback visual causa percepção de "sistema lento".
 *   Optimistic update dá feedback em <16ms.
 *
 * Alternativa descartada: optimistic no delete
 * — Por quê: delete é destrutivo. Mostrar o item sumindo e depois
 *   reaparecendo por erro seria confuso. Melhor aguardar confirmação.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../services/patient.service";
import { notifySuccess } from "@/lib/notifications";
import type { Patient } from "@/types";

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
      notifySuccess("Paciente cadastrado com sucesso.");
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof patientService.update>[1] }) =>
      patientService.update(id, data),

    // Optimistic update: atualiza cache antes da response
    onMutate: async ({ id, data }) => {
      // Cancela queries em andamento para evitar sobrescrever o optimistic
      await queryClient.cancelQueries({ queryKey: patientKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: patientKeys.all });

      // Snapshot do estado anterior para rollback
      const previousDetail = queryClient.getQueryData<Patient>(patientKeys.detail(id));
      const previousLists = queryClient.getQueriesData<Patient[]>({ queryKey: patientKeys.all });

      // Atualiza o detail cache otimisticamente
      if (previousDetail) {
        queryClient.setQueryData<Patient>(patientKeys.detail(id), {
          ...previousDetail,
          ...data,
        } as Patient);
      }

      return { previousDetail, previousLists };
    },

    // Rollback em caso de erro
    onError: (_error, { id }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(patientKeys.detail(id), context.previousDetail);
      }
      if (context?.previousLists) {
        for (const [queryKey, data] of context.previousLists) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    // Sempre revalida após settle para garantir consistência
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
    },

    onSuccess: () => {
      notifySuccess("Paciente atualizado com sucesso.");
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      notifySuccess("Paciente excluído com sucesso.");
    },
  });
}

export function useForceDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientService.forceDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      notifySuccess("Paciente e registros vinculados excluídos.");
    },
  });
}
