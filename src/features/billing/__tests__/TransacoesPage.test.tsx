import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { professionalService } from '@/features/professionals/services/professional.service';
import TransacoesPage from '../pages/TransacoesPage';
import { billingService, type DailySummary } from '../services/billing.service';
import type { Billing } from '@/types';

const summary: DailySummary = {
  date: '2026-10-24',
  byMethod: [{ paymentMethod: 'pix', count: 2, total: 130 }, { paymentMethod: 'cash', count: 1, total: 40 }],
  total: 170,
  discounts: 10,
  count: 3,
  pending: [{ billingId: 'b9', patientName: 'Joana Prado', serviceName: 'Gel', amount: 90 }],
};

const billing: Billing = {
  id: 'b1', appointmentId: 'a1', amount: '50.00', discount: '10.00', paymentMethod: 'cash', status: 'paid',
  paidAt: '2026-10-24T11:00:00.000Z', createdAt: '2026-10-24T10:00:00.000Z', updatedAt: '2026-10-24T11:00:00.000Z',
  patientName: 'Maria Souza', serviceName: 'Manicure', professionalName: 'Ana Lima',
};

describe('TransacoesPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(billingService, 'list').mockResolvedValue([billing]);
    vi.spyOn(billingService, 'dailySummary').mockResolvedValue(summary);
    vi.spyOn(professionalService, 'listActive').mockResolvedValue([]);
  });

  it('fechamento do dia mostra totais por forma, descontos e pendentes', async () => {
    renderWithProviders(<TransacoesPage />);
    const closing = await screen.findByRole('region', { name: 'Fechamento do dia' });
    expect(await within(closing).findByText(/R\$\s170,00/)).toBeInTheDocument();
    expect(within(closing).getByText('Pix')).toBeInTheDocument();
    expect(within(closing).getByText('Dinheiro')).toBeInTheDocument();
    expect(within(closing).getByText(/R\$\s10,00/)).toBeInTheDocument();
    expect(within(closing).getByText('Joana Prado · Gel')).toBeInTheDocument();
  });

  it('lista com serviço e profissional e filtros chamam o serviço com os parâmetros', async () => {
    renderWithProviders(<TransacoesPage />);
    expect((await screen.findAllByText('Manicure')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ana Lima').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByRole('combobox', { name: 'Forma de pagamento' }), { target: { value: 'pix' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Filtrar por status' }), { target: { value: 'paid' } });
    await waitFor(() => expect(billingService.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ paymentMethod: 'pix', status: 'paid', limit: '200', from: expect.any(String), to: expect.any(String) }),
    ));
  });

  it('trocar a data do fechamento consulta o dia escolhido', async () => {
    renderWithProviders(<TransacoesPage />);
    fireEvent.change(await screen.findByLabelText('Data do fechamento'), { target: { value: '2026-10-20' } });
    await waitFor(() => expect(billingService.dailySummary).toHaveBeenLastCalledWith('2026-10-20'));
  });
});
