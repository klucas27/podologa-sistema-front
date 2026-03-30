/**
 * Hook unificado de autenticação.
 *
 * Lê estado do Zustand (auth.store) e expõe mutations do React Query.
 * API pública mantida idêntica ao AuthContext anterior para minimizar
 * mudanças nos consumidores.
 *
 * Subscrições granulares: cada componente re-renderiza APENAS quando
 * a fatia de estado que consome muda — ao contrário do Context, onde
 * qualquer mudança re-renderiza toda a árvore.
 */

import { useAuthStore } from "@/stores/auth.store";
import { useSignIn, useSignOut } from "@/hooks/useAuthQuery";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  const signInMutation = useSignIn();
  const signOutMutation = useSignOut();

  const signIn = async (username: string, password: string) => {
    return signInMutation.mutateAsync({ username, password });
  };

  const signOut = () => {
    signOutMutation.mutate();
  };

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
  };
}
