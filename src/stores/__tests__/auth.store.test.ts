import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/types';

const mockUser: User = {
  id: '1',
  username: 'dr.joao',
  professionalName: 'Dr. João',
  role: 'admin',
  professionalId: null,
  workdayStart: '08:00',
  workdayEnd: '18:00',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useAuthStore.getState().clearAuth();
      useAuthStore.setState({ isLoading: true });
    });
  });

  it('inicia com estado padrão: não autenticado e carregando', () => {
    // Arrange & Act
    const state = useAuthStore.getState();

    // Assert
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('setAuth define user, role e isAuthenticated', () => {
    // Arrange & Act
    act(() => {
      useAuthStore.getState().setAuth(mockUser, 'admin');
    });

    // Assert
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.role).toBe('admin');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('clearAuth limpa todos os dados de autenticação', () => {
    // Arrange
    act(() => {
      useAuthStore.getState().setAuth(mockUser, 'admin');
    });

    // Act
    act(() => {
      useAuthStore.getState().clearAuth();
    });

    // Assert
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('setLoading atualiza apenas o isLoading', () => {
    // Arrange
    act(() => {
      useAuthStore.getState().setAuth(mockUser, 'admin');
    });

    // Act
    act(() => {
      useAuthStore.getState().setLoading(true);
    });

    // Assert
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(true);
    expect(state.user).toEqual(mockUser); // user não foi afetado
    expect(state.isAuthenticated).toBe(true);
  });

  it('suporta role professional', () => {
    // Arrange
    const professionalUser: User = {
      ...mockUser,
      role: 'professional',
      professionalId: 'prof-1',
    };

    // Act
    act(() => {
      useAuthStore.getState().setAuth(professionalUser, 'professional');
    });

    // Assert
    const state = useAuthStore.getState();
    expect(state.role).toBe('professional');
    expect(state.user?.professionalId).toBe('prof-1');
  });
});
