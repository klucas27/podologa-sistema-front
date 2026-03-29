/**
 * QueryClient configurado com defaults inteligentes.
 *
 * staleTime: 1 minuto para dados frequentes (pacientes, agendamentos).
 * Dado "stale" = React Query revalida em background na próxima query.
 * 1min é o equilíbrio: evita requests desnecessários sem mostrar dados
 * desatualizados por muito tempo em contexto clínico.
 *
 * retry: 1 (não 3 padrão).
 * Erros de auth (401/403) não devem ser retriados — o token expirou
 * e retry só atrasa o redirect para login. 3 retries no default do
 * React Query transformam um erro de 200ms em 4.8s de espera.
 *
 * refetchOnWindowFocus: false para dados sensíveis.
 * Em sistema clínico, refetch automático ao trocar de aba pode causar
 * perda de contexto visual e confusão no loading state.
 *
 * Alternativa descartada: staleTime: Infinity (cache permanente)
 * — Por quê: em sistema clínico multi-usuário, dados ficam
 *   desatualizados silenciosamente. 1min garante eventual consistency.
 *
 * Alternativa descartada: retry: 3 (default)
 * — Por quê: 3 retries com backoff exponencial = ~5s de espera.
 *   Para erros de auth é desperdício. Para erros de rede, 1 retry
 *   já cobre a maioria dos blips transitórios.
 */

import { QueryClient, type Mutation } from "@tanstack/react-query";
import { notifyError } from "@/lib/notifications";
import { ApiError } from "@/lib/api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minuto
      retry: (failureCount, error) => {
        // Não retria erros de autenticação/autorização
        if (error instanceof ApiError && [401, 403, 422].includes(error.status)) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      onError: (error: Error) => {
        // Notificação global para mutations —
        // mutations individuais podem sobrescrever com onError próprio
        notifyError(error);
      },
    },
  },
});
