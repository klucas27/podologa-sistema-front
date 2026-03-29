import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/types';

const mockAdmin: User = {
  id: '1',
  username: 'admin',
  professionalName: null,
  role: 'admin',
  professionalId: null,
  workdayStart: '08:00',
  workdayEnd: '18:00',
};

const mockProfessional: User = {
  id: '2',
  username: 'profissional',
  professionalName: 'Dr. Ana',
  role: 'professional',
  professionalId: 'prof-1',
  workdayStart: '08:00',
  workdayEnd: '18:00',
};

function renderWithRouter(
  initialRoute: string,
  allowedRoles?: ('admin' | 'professional')[],
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
            <Route path="/admin" element={<div>Admin Panel</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/acesso-negado" element={<div>Acesso Negado</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('mostra spinner enquanto isLoading é true', () => {
    // Arrange
    useAuthStore.setState({ isLoading: true });

    // Act
    renderWithRouter('/dashboard');

    // Assert — spinner presente (div com animate-spin)
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('redireciona para /login quando não autenticado', () => {
    // Arrange
    useAuthStore.setState({ isLoading: false, isAuthenticated: false });

    // Act
    renderWithRouter('/dashboard');

    // Assert
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('renderiza conteúdo protegido quando autenticado', () => {
    // Arrange
    useAuthStore.getState().setAuth(mockAdmin, 'admin');

    // Act
    renderWithRouter('/dashboard');

    // Assert
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('renderiza conteúdo quando role está na lista permitida', () => {
    // Arrange
    useAuthStore.getState().setAuth(mockAdmin, 'admin');

    // Act
    renderWithRouter('/admin', ['admin']);

    // Assert
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('redireciona para /acesso-negado quando role não é permitida', () => {
    // Arrange
    useAuthStore.getState().setAuth(mockProfessional, 'professional');

    // Act
    renderWithRouter('/admin', ['admin']);

    // Assert
    expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('permite acesso quando allowedRoles não é definido', () => {
    // Arrange
    useAuthStore.getState().setAuth(mockProfessional, 'professional');

    // Act
    renderWithRouter('/dashboard');

    // Assert
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });
});
