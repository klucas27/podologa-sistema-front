/**
 * Zustand UI Store — estado global de interface.
 *
 * Persist middleware APENAS para preferências visuais (sidebarCollapsed).
 *
 * ⚠ SEGURANÇA: NUNCA persista tokens, dados de sessão ou informações
 * sensíveis via persist. O localStorage é acessível a qualquer script
 * na mesma origem — um XSS teria acesso completo. Mesmo com HTTPOnly
 * cookies para auth, expor dados sensíveis em localStorage anula a proteção.
 *
 * Alternativa descartada: Context API para UI state
 * — Por quê: mudanças no sidebar collapsed causariam re-render em
 *   TODOS os componentes que consomem o contexto, incluindo os que
 *   só precisam do tema ou das notificações.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ── Toast / Notification ────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// ── Store ───────────────────────────────────────────────────

interface UIState {
  sidebarCollapsed: boolean;
  toasts: Toast[];
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

type UIStore = UIState & UIActions;

let toastCounter = 0;

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toasts: [],

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      addToast: (toast) => {
        const id = `toast-${++toastCounter}-${Date.now()}`;
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));

        const duration = toast.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            set((state) => ({
              toasts: state.toasts.filter((t) => t.id !== id),
            }));
          }, duration);
        }
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: "podo-ui-preferences",
      storage: createJSONStorage(() => localStorage),
      // Persiste APENAS preferências visuais, NUNCA toasts/dados transientes
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
