import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { useAuthStore } from '@/stores/auth.store';
import EncaminhamentosPage from '../pages/EncaminhamentosPage';
import { referralService } from '../services/referral.service';
import type { Referral } from '../services/referral.service';

const pending: Referral = {
  id: 'r1', patientId: 'pa1', patientName: 'Maria Silva', fromProfessionalId: 'm1', fromProfessionalName: 'Ana Lima',
  toProfessionalId: null, toProfessionalName: null, sourceAppointmentId: 'a1', resultingAppointmentId: null,
  reason: 'Unha encravada', status: 'pending', createdAt: '2026-10-20T10:00:00.000Z', updatedAt: '2026-10-20T10:00:00.000Z',
};

const user = { id: 'u', username: 'u', professionalName: null, professionalId: null, workdayStart: '08:00', workdayEnd: '18:00' };

describe('EncaminhamentosPage', () => {
  beforeEach(() => {
    vi.spyOn(referralService, 'list').mockImplementation(async (status) => (status === 'pending' ? [pending] : []));
  });

  it('recepção agenda com a podóloga e marca recusa', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'recepcao' }, 'recepcao');
    const decline = vi.spyOn(referralService, 'decline').mockResolvedValue({ ...pending, status: 'declined' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderWithProviders(<EncaminhamentosPage />);
    expect(await screen.findByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('Unha encravada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agendar com a podóloga' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cliente recusou' }));
    await waitFor(() => expect(decline).toHaveBeenCalledWith('r1'));
  });

  it('manicure só acompanha, sem ações', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'manicure', professionalId: 'm1' }, 'manicure');
    renderWithProviders(<EncaminhamentosPage />);
    expect(await screen.findByText('Maria Silva')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agendar com a podóloga' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cliente recusou' })).not.toBeInTheDocument();
  });

  it('troca de aba busca outro status', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'admin' }, 'admin');
    renderWithProviders(<EncaminhamentosPage />);
    await screen.findByText('Maria Silva');
    fireEvent.click(screen.getByRole('tab', { name: 'Concluídos' }));
    expect(await screen.findByText('Nenhum encaminhamento aqui.')).toBeInTheDocument();
    expect(referralService.list).toHaveBeenCalledWith('completed');
  });
});
