import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type { User, AuthState } from "@/types";
import { api, setCsrfToken } from "@/services/api";

interface LoginApiResponse {
  data: {
    user: User;
    csrfToken: string;
  };
}

interface MeApiResponse {
  data: User;
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

  // Restaura sessão ao montar — se o cookie HTTP-only ainda for válido,
  // o backend retorna os dados do usuário autenticado.
  useEffect(() => {
    let cancelled = false;

    api
      .get<MeApiResponse>("/api/auth/me")
      .then((res) => {
        if (!cancelled) {
          setState({
            user: res.data,
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
      setCsrfToken(null);
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, signIn, signOut }),
    [state, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
