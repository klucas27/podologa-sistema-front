import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quoteService } from "../services/quote.service";
import type { QuoteInput } from "../services/quote.service";
import { notifySuccess } from "@/lib/notifications";

const quoteKey = (appointmentId: string) => ["quotes", appointmentId] as const;

/** Orçamento da avaliação; `enabled` só para quem pode ler (admin, podóloga, recepção). */
export function useQuote(appointmentId: string, enabled = true) {
  return useQuery({
    queryKey: quoteKey(appointmentId),
    queryFn: () => quoteService.getByAppointment(appointmentId),
    enabled: !!appointmentId && enabled,
  });
}

export function useSaveQuote(appointmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: QuoteInput }) =>
      id ? quoteService.update(id, data) : quoteService.create(appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKey(appointmentId) });
      notifySuccess("Orçamento salvo.");
    },
  });
}
