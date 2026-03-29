import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type { User, UserRole, AuthState } from "@/types";
import {
  api,
  setCsrfToken,
  setOnAuthFailure,
  setOnForbidden,
  setOnRateLimited,
} from "@/lib/api";

interface LoginApiResponse {
  data: {
    user: User;
    csrfToken: string;
  };
}

interface MeApiResponse {
  data: {
    user: User;
    csrfToken: string;
  };
}

interface AuthContextData extends AuthState {
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
  rateLimitMessage: string | null;
  clearRateLimitMessage: () => void;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData,
);

/**
 * Normaliza o valor de role que vem do backend.
 */
function extractRole(user: Partial<User>): UserRole {
  const raw = (user as Record<string, unknown>).role;
  if (raw === "admin" || raw === "professional") return raw;
  return "admin";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  const clearRateLimitMessage = useCallback(() => {
    setRateLimitMessage(null);
  }, []);

  const clearSession = useCallback(() => {
    setCsrfToken(null);
    setState({ user: null, role: null, isAuthenticated: false, isLoading: false });
  }, []);

  // Registra callbacks para os interceptors do api.ts
  useEffect(() => {
    setOnAuthFailure(clearSession);

    setOnForbidden(() => {
      // O ProtectedRoute já trata o redirect via role.
      // Aqui limpamos apenas se necessário (ex: token revogado com role alterada).
    });

    setOnRateLimited((retryAfter) => {
      const seconds = retryAfter ?? 30;
      setRateLimitMessage(
        `Muitas requisições. Aguarde ${seconds}s antes de tentar novamente.`,
      );
      window.setTimeout(() => setRateLimitMessage(null), seconds * 1000);
    });

    return () => {
      setOnAuthFailure(null);
      setOnForbidden(null);
      setOnRateLimited(null);
    };
  }, [clearSession]);

  // Restaura sessão ao montar — se o cookie access_token ainda for válido,
  // o backend retorna os dados do usuário + novo csrfToken.
  useEffect(() => {
    let cancelled = false;

    api
      .get<MeApiResponse>("/api/auth/me")
      .then((res) => {
        if (!cancelled) {
          const user = res.data.user;
          const role = extractRole(user);
          setCsrfToken(res.data.csrfToken);
          setState({
            user: { ...user, role },
            role,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ user: null, role: null, isAuthenticated: false, isLoading: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const res = await api.post<LoginApiResponse>("/api/auth/login", {
        username,
        password,
      });

      const user = res.data.user;
      const role = extractRole(user);
      setCsrfToken(res.data.csrfToken);
      setState({
        user: { ...user, role },
        role,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState({ user: null, role: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ ...state, signIn, signOut, rateLimitMessage, clearRateLimitMessage }),
    [state, signIn, signOut, rateLimitMessage, clearRateLimitMessage],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
