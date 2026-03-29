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
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Restaura sessão — substitui o useEffect com api.get("/auth/me")
  useSessionQuery();

  // Registra callbacks para interceptors do api.ts
  useEffect(() => {
    const cleanup = setupAuthInterceptors();
    return cleanup;
  }, []);

  return <>{children}</>;
};

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <ToastContainer />
        {children}
      </AuthInitializer>
    </QueryClientProvider>
  );
};
