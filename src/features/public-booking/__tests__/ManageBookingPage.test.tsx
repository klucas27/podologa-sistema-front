import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '@/test/test-utils';
import { PublicApiError } from '@/lib/publicApi';
import ManageBookingPage from '../pages/ManageBookingPage';
import { publicBookingService, type ManagedBooking } from '../services/publicBooking.service';

vi.mock('../services/publicBooking.service', async (importOriginal) => {
  const actual = await importOriginal<object>();
  return {
    ...actual,
    publicBookingService: {
      info: vi.fn(),
      manage: vi.fn(),
      cancel: vi.fn(),
      manageAvailability: vi.fn(),
      reschedule: vi.fn(),
    },
  };
});

const service = vi.mocked(publicBookingService);
const TOKEN = 'a'.repeat(43);

const booking = (over: Partial<ManagedBooking> = {}): ManagedBooking => ({
  serviceName: 'Manicure',
  professionalId: '22222222-2222-2222-2222-222222222222',
  professionalFirstName: 'Ana',
  start: '2026-11-10T10:00',
  end: '2026-11-10T10:30',
  status: 'scheduled',
  canChange: true,
  changeDeadline: '2026-11-10T04:00',
  ...over,
});

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/agendamento/:slug/:token" element={<ManageBookingPage />} />
    </Routes>,
    { routerProps: { initialEntries: [`/agendamento/nalu-nails/${TOKEN}`] } },
  );

describe('ManageBookingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.info.mockResolvedValue({
      businessName: 'Nálu Nails', address: null, phoneDisplay: '(12) 99999-0000',
      consentText: '', consentVersion: '1', services: [], professionals: [],
    });
  });

  it('alterável: mostra prazo e cancelar chama o serviço após confirmação', async () => {
    service.manage.mockResolvedValue(booking());
    service.cancel.mockResolvedValue({ status: 'cancelled' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { user } = renderPage();

    expect(await screen.findByText(/Você pode cancelar ou remarcar até/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar horário' }));

    await waitFor(() => expect(service.cancel).toHaveBeenCalledWith('nalu-nails', TOKEN));
    expect(await screen.findByRole('alert')).toHaveTextContent('Seu horário foi cancelado.');
    expect(screen.getByRole('link', { name: 'Agendar novo horário' })).toHaveAttribute('href', '/agendar/nalu-nails');
  });

  it('prazo encerrado: sem botões e com o telefone do salão', async () => {
    service.manage.mockResolvedValue(booking({ canChange: false }));
    renderPage();

    expect(await screen.findByText(/O prazo para alterar pelo link terminou/)).toHaveTextContent('(12) 99999-0000');
    expect(screen.queryByRole('button', { name: 'Remarcar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar horário' })).not.toBeInTheDocument();
  });

  it('token inválido: mensagem de link inválido', async () => {
    service.manage.mockRejectedValue(new PublicApiError(404, 'Link inválido ou expirado'));
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Link inválido' })).toBeInTheDocument();
  });

  it('remarcar mantém a mesma profissional por padrão', async () => {
    service.manage.mockResolvedValue(booking());
    service.manageAvailability.mockResolvedValue({ days: [{ date: '2026-11-12', slots: ['14:00'] }] });
    service.reschedule.mockResolvedValue(booking({ start: '2026-11-12T14:00', end: '2026-11-12T14:30' }));
    const { user } = renderPage();

    await user.click(await screen.findByRole('button', { name: 'Remarcar' }));
    await user.click(await screen.findByRole('button', { name: /12 de nov/i }));
    await user.click(screen.getByRole('button', { name: '14:00' }));

    await waitFor(() => expect(service.reschedule).toHaveBeenCalledWith('nalu-nails', TOKEN, {
      start: '2026-11-12T14:00', professionalId: '22222222-2222-2222-2222-222222222222',
    }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Horário remarcado');
  });
});
