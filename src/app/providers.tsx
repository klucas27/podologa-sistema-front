import React, { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useSessionQuery, setupAuthInterceptors } from "@/hooks/useAuthQuery";
import ToastContainer from "@/components/ui/ToastContainer";

/**
 * AuthInitializer: substitui o AuthProvider/Context.
 *
 * Usa React Query para restaurar a sessão (/auth/me) e registra
 * os interceptors do api.ts uma única vez.
 *
 * Sem Context Provider: o estado vive no Zustand store.
 * O useSessionQuery dispara o fetch do /auth/me e atualiza o store.
 */
/** Interceptors do painel, sem buscar /auth/me. Usado no link público. */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const cleanup = setupAuthInterceptors();
    return cleanup;
  }, []);

  return <>{children}</>;
};

/** Restaura a sessão do painel. Não montar em rotas que começam com /agendar. */
const SessionAuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useSessionQuery();
  return <AuthInitializer>{children}</AuthInitializer>;
};

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const Shell = window.location.pathname.startsWith('/agendar') ? AuthInitializer : SessionAuthInitializer;
  return (
    <QueryClientProvider client={queryClient}>
      <Shell>
        <ToastContainer />
        {children}
      </Shell>
    </QueryClientProvider>
  );
};
