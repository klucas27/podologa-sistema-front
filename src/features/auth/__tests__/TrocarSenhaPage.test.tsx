import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import TrocarSenhaPage from '@/features/auth/pages/TrocarSenhaPage';
import { useAuthStore } from '@/stores/auth.store';
import { settingsService } from '@/features/settings/services/settings.service';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/features/settings/services/settings.service', () => ({
  settingsService: { changePassword: vi.fn() },
}));

describe('TrocarSenhaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setAuth(
      { id: '1', username: 'rec', professionalName: null, role: 'recepcao', professionalId: null, workdayStart: '08:00', workdayEnd: '18:00', mustChangePassword: true },
      'recepcao',
    );
  });

  it('aplica a regra de 10+ caracteres com letra e número antes de enviar', async () => {
    const { user } = renderWithProviders(<TrocarSenhaPage />);
    await user.type(screen.getByLabelText('Senha atual'), 'provisoria1');
    await user.type(screen.getByLabelText('Nova senha'), 'somenteletras');
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'somenteletras');
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('letra e número');
    expect(settingsService.changePassword).not.toHaveBeenCalled();
  });

  it('troca a senha, limpa o flag e vai para a tela inicial do perfil', async () => {
    vi.mocked(settingsService.changePassword).mockResolvedValue(undefined);
    const { user } = renderWithProviders(<TrocarSenhaPage />);
    await user.type(screen.getByLabelText('Senha atual'), 'provisoria1');
    await user.type(screen.getByLabelText('Nova senha'), 'definitiva123');
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'definitiva123');
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/agendamentos', { replace: true }));
    expect(settingsService.changePassword).toHaveBeenCalledWith({ currentPassword: 'provisoria1', newPassword: 'definitiva123' });
    expect(useAuthStore.getState().user?.mustChangePassword).toBe(false);
  });
});
