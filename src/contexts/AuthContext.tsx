import React, { createContext, useState, useCallback, useMemo } from 'react';
import type { User, AuthState } from '@/types';

interface AuthContextData extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const storedUser = localStorage.getItem('@PodoSistema:user');
    if (storedUser) {
      return { user: JSON.parse(storedUser), isAuthenticated: true, isLoading: false };
    }
    return { user: null, isAuthenticated: false, isLoading: false };
  });

  const signIn = useCallback(async (email: string, _password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // TODO: integrar com API real
    // Simulação de login para desenvolvimento
    const fakeUser: User = {
      id: '1',
      name: 'Dra. Maria Silva',
      email,
      role: 'podologa',
    };

    localStorage.setItem('@PodoSistema:user', JSON.stringify(fakeUser));
    setState({ user: fakeUser, isAuthenticated: true, isLoading: false });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@PodoSistema:user');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const value = useMemo(
    () => ({ ...state, signIn, signOut }),
    [state, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
