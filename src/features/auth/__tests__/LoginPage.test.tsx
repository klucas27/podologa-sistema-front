import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import LoginPage from '@/features/auth/pages/LoginPage';
import { useAuthStore } from '@/stores/auth.store';

// Mock useAuth
const mockSignIn = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    isLoading: useAuthStore.getState().isLoading,
    user: useAuthStore.getState().user,
    role: useAuthStore.getState().role,
    isAuthenticated: useAuthStore.getState().isAuthenticated,
    signOut: vi.fn(),
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it('renderiza campos de usuário e senha com labels', () => {
    // Arrange & Act
    renderWithProviders(<LoginPage />);

    // Assert
    expect(screen.getByLabelText('Usuário')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('submete formulário válido e navega para /dashboard', async () => {
    // Arrange
    mockSignIn.mockResolvedValue(undefined);
    const { user } = renderWithProviders(<LoginPage />);

    // Act
    await user.type(screen.getByLabelText('Usuário'), 'dr.joao');
    await user.type(screen.getByLabelText('Senha'), '123456');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    // Assert
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('dr.joao', '123456');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('exibe erro de validação Zod quando username é muito curto', async () => {
    // Arrange
    const { user } = renderWithProviders(<LoginPage />);

    // Act
    await user.type(screen.getByLabelText('Usuário'), 'ab');
    await user.type(screen.getByLabelText('Senha'), '123456');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Usuário deve ter pelo menos 3 caracteres')).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('exibe erro de validação Zod quando senha é muito curta', async () => {
    // Arrange
    const { user } = renderWithProviders(<LoginPage />);

    // Act
    await user.type(screen.getByLabelText('Usuário'), 'dr.joao');
    await user.type(screen.getByLabelText('Senha'), '12345');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('exibe mensagem genérica de credenciais inválidas quando signIn falha', async () => {
    // Arrange
    const { ApiError } = await import('@/lib/api');
    mockSignIn.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    const { user } = renderWithProviders(<LoginPage />);

    // Act
    await user.type(screen.getByLabelText('Usuário'), 'dr.joao');
    await user.type(screen.getByLabelText('Senha'), 'senhaerrada');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas. Tente novamente.')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('exibe mensagem de rate limit quando recebe 429', async () => {
    // Arrange
    const { ApiError } = await import('@/lib/api');
    mockSignIn.mockRejectedValue(new ApiError(429, 'Too Many Requests'));
    const { user } = renderWithProviders(<LoginPage />);

    // Act
    await user.type(screen.getByLabelText('Usuário'), 'dr.joao');
    await user.type(screen.getByLabelText('Senha'), '123456');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Muitas tentativas de login. Aguarde antes de tentar novamente.')).toBeInTheDocument();
    });
  });

  it('mostra botão de loading durante submissão', async () => {
    // Arrange — signIn que nunca resolve para manter loading state
    mockSignIn.mockImplementation(() => new Promise(() => {}));
    useAuthStore.setState({ isLoading: true });
    const { user } = renderWithProviders(<LoginPage />);

    // Assert
    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();
  });

  it('tem link para página de registro', () => {
    // Arrange & Act
    renderWithProviders(<LoginPage />);

    // Assert
    expect(screen.getByRole('button', { name: /não tem conta/i })).toBeInTheDocument();
  });

  it('navega para /register ao clicar no link de registro', async () => {
    // Arrange
    const { user } = renderWithProviders(<LoginPage />);

    // Act
    await user.click(screen.getByRole('button', { name: /não tem conta/i }));

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});
