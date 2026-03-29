/**
 * React Query hooks para autenticação.
 *
 * POR QUE React Query elimina useEffect para fetch:
 * ─────────────────────────────────────────────────
 * useEffect + useState para data fetching tem problemas fundamentais:
 *
 * 1. Race conditions: se o componente desmonta e remonta, duas requests
 *    podem estar "in flight" simultaneamente. O useEffect não cancela
 *    a request anterior — exige cleanup manual com flags `cancelled`.
 *
 * 2. Estado duplicado: você precisa de `loading`, `error`, `data` em
 *    useState — React Query gerencia isso automaticamente.
 *
 * 3. Cache inexistente: cada mount dispara uma nova request. React Query
 *    serve do cache e revalida em background (stale-while-revalidate).
 *
 * 4. Sem deduplicação: 5 componentes que chamam useEffect com o mesmo
 *    endpoint = 5 requests. React Query deduplica automaticamente.
 *
 * 5. Sem retry/refetch: implementar retry, refetch on focus, polling
 *    e invalidação manual com useEffect é centenas de linhas de código
 *    que React Query resolve com config declarativa.
 *
 * Alternativa descartada: SWR (Vercel)
 * — Por quê: não tem suporte nativo a mutations, optimistic updates nem
 *   invalidação por query key hierarchy. React Query é mais completo
 *   para aplicações com CRUD intenso.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, setCsrfToken, setOnAuthFailure, setOnForbidden, setOnRateLimited } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { notifyError, notifyWarning } from "@/lib/notifications";
import type { User, UserRole } from "@/types";

// ── Types ───────────────────────────────────────────────────

interface AuthApiResponse {
  data: {
    user: User;
    csrfToken: string;
  };
}

// ── Query Keys ──────────────────────────────────────────────

export const authKeys = {
  session: ["auth", "session"] as const,
};

// ── Helpers ─────────────────────────────────────────────────

function extractRole(user: Partial<User>): UserRole {
  const raw = (user as Record<string, unknown>).role;
  if (raw === "admin" || raw === "professional") return raw;
  return "admin";
}

// ── Setup interceptors (chamado uma vez no provider) ───────

export function setupAuthInterceptors(): () => void {
  const { clearAuth } = useAuthStore.getState();

  setOnAuthFailure(() => {
    clearAuth();
  });

  setOnForbidden(() => {
    // ProtectedRoute trata redirect por role.
    // Toast feedback para o usuário:
    notifyError({ status: 403, message: "Acesso negado", name: "ApiError" });
  });

  setOnRateLimited((retryAfter) => {
    const seconds = retryAfter ?? 30;
    notifyWarning(
      `Muitas requisições. Aguarde ${seconds}s antes de tentar novamente.`,
    );
  });

  return () => {
    setOnAuthFailure(null);
    setOnForbidden(null);
    setOnRateLimited(null);
  };
}

// ── useSessionQuery: substitui useEffect(/auth/me) ─────────

export function useSessionQuery() {
  const { setAuth, clearAuth, setLoading } = useAuthStore.getState();

  return useQuery({
    queryKey: authKeys.session,
    queryFn: async (): Promise<User> => {
      const res = await api.get<AuthApiResponse>("/api/auth/me");
      const user = res.data.user;
      const role = extractRole(user);
      setCsrfToken(res.data.csrfToken);
      setAuth({ ...user, role }, role);
      return user;
    },
    retry: false,
    staleTime: Infinity, // sessão não fica "stale" — só invalida explicitamente
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    meta: {
      onSettled: (_data: unknown, error: unknown) => {
        if (error) {
          clearAuth();
        }
      },
    },
  });
}

// ── useSignIn mutation ──────────────────────────────────────

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }): Promise<User> => {
      const { setLoading } = useAuthStore.getState();
      setLoading(true);

      const res = await api.post<AuthApiResponse>("/api/auth/login", {
        username,
        password,
      });

      const user = res.data.user;
      const role = extractRole(user);
      setCsrfToken(res.data.csrfToken);

      const { setAuth } = useAuthStore.getState();
      setAuth({ ...user, role }, role);

      return user;
    },
    onSuccess: (user) => {
      // Atualiza o cache da sessão para evitar refetch
      queryClient.setQueryData(authKeys.session, user);
    },
    onError: (error) => {
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      notifyError(error);
    },
  });
}

// ── useSignOut mutation ─────────────────────────────────────

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await api.post("/api/auth/logout");
      } catch {
        // Mesmo se o logout falhar no server, limpamos localmente
      }
    },
    onSettled: () => {
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      setCsrfToken(null);
      queryClient.removeQueries({ queryKey: authKeys.session });
      queryClient.clear();
    },
  });
}
