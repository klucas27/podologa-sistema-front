import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import UsuariosPage from '../pages/UsuariosPage';
import { userService, type ManagedUser } from '../services/user.service';
import { professionalService } from '@/features/professionals/services/professional.service';
import { generateTemporaryPassword } from '../hooks/useUsers';

const users: ManagedUser[] = [
  { id: 'a', username: 'dona', role: 'admin', professionalId: null, professionalName: null, isActive: true, mustChangePassword: false, createdAt: '' },
  { id: 'r', username: 'recepcao', role: 'recepcao', professionalId: null, professionalName: null, isActive: true, mustChangePassword: false, createdAt: '' },
  { id: 'm', username: 'ana', role: 'manicure', professionalId: 'p1', professionalName: 'Ana Lima', isActive: false, mustChangePassword: false, createdAt: '' },
];

describe('UsuariosPage', () => {
  beforeEach(() => {
    vi.spyOn(userService, 'list').mockResolvedValue(users);
    vi.spyOn(professionalService, 'listActive').mockResolvedValue([]);
  });

  it('lista usuários com perfil e profissional; admin sem ações', async () => {
    renderWithProviders(<UsuariosPage />);
    expect(await screen.findByText('Ana Lima', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('(inativo)')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar dona' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar ana' })).toBeInTheDocument();
  });

  it('modal de criação não oferece o perfil administradora', async () => {
    renderWithProviders(<UsuariosPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Novo usuário' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Recepção' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Administradora' })).not.toBeInTheDocument();
  });

  it('senha temporária tem 10 caracteres com letra e número', () => {
    const p = generateTemporaryPassword();
    expect(p).toHaveLength(10);
    expect(p).toMatch(/[a-z]/);
    expect(p).toMatch(/\d/);
  });
});
