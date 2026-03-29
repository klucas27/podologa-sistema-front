/**
 * Zustand Auth Store — estado de UI de autenticação.
 *
 * APENAS estado de UI aqui: user, role, isAuthenticated.
 * O estado de servidor (sessão, tokens) é gerenciado por React Query.
 *
 * ⚠ NENHUM dado sensível é persistido via localStorage/persist.
 * Risco: qualquer XSS teria acesso a tokens em localStorage.
 * Persist middleware é seguro APENAS para preferências visuais
 * (tema, sidebar colapsada), NUNCA para tokens ou dados de auth.
 *
 * Alternativa descartada: Redux Toolkit
 * — Por quê: boilerplate excessivo (slices, reducers, actions)
 *   para um estado simples. Zustand é ~1KB, zero boilerplate,
 *   e não precisa de Provider wrapper.
 *
 * Alternativa descartada: React Context (padrão anterior)
 * — Por quê: causa re-renders em toda a árvore quando QUALQUER
 *   propriedade do contexto muda. Zustand permite subscrições
 *   granulares — um componente que lê `user.role` não re-renderiza
 *   quando `isLoading` muda.
 */

import { create } from "zustand";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (user: User, role: UserRole) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create<AuthStore>()((set) => ({
  ...initialState,

  setAuth: (user, role) =>
    set({ user, role, isAuthenticated: true, isLoading: false }),

  clearAuth: () =>
    set({ user: null, role: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),
}));
