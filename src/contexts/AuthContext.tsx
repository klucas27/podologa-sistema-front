import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type { User, AuthState } from "@/types";
import { api, setCsrfToken, setOnAuthFailure } from "@/services/api";

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
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const clearSession = useCallback(() => {
    setCsrfToken(null);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  // Registra callback para o interceptor de refresh chamar
  // quando NEM o refresh token é mais válido → force logout.
  useEffect(() => {
    setOnAuthFailure(clearSession);
    return () => setOnAuthFailure(null);
  }, [clearSession]);

  // Restaura sessão ao montar — se o cookie access_token ainda for válido,
  // o backend retorna os dados do usuário + novo csrfToken.
  // Se o access_token expirou mas o refresh_token existe, o interceptor
  // em api.ts faz refresh automático antes de retry.
  useEffect(() => {
    let cancelled = false;

    api
      .get<MeApiResponse>("/api/auth/me")
      .then((res) => {
        if (!cancelled) {
          setCsrfToken(res.data.csrfToken);
          setState({
            user: res.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ user: null, isAuthenticated: false, isLoading: false });
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

      setCsrfToken(res.data.csrfToken);
      setState({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
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
    () => ({ ...state, signIn, signOut }),
    [state, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
