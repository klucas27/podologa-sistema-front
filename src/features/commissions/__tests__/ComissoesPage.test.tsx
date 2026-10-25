import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { useAuthStore } from '@/stores/auth.store';
import { professionalService } from '@/features/professionals/services/professional.service';
import ComissoesPage, { commissionRule } from '../pages/ComissoesPage';
import { commissionService, type CommissionReport } from '../services/commission.service';

const user = { id: 'u', username: 'u', professionalName: null, professionalId: null, workdayStart: '08:00', workdayEnd: '18:00' };

const report: CommissionReport = {
  period: { from: '2026-10-01', to: '2026-10-24' },
  total: 61,
  byProfessional: [{ professionalId: 'p1', name: 'Ana', count: 2, net: 140, commission: 61 }],
  items: [
    { billingId: 'b1', paidAt: '10/10/2026 11:00', patientFirstName: 'Maria', serviceName: 'Gel', professionalName: 'Ana',
      amount: 90, discount: 0, net: 90, rate: 40, fixed: 5, commission: 41 },
    { billingId: 'b2', paidAt: '12/10/2026 15:30', patientFirstName: 'Joana', serviceName: 'Manicure', professionalName: 'Ana',
      amount: 50, discount: 0, net: 50, rate: 40, fixed: null, commission: 20 },
  ],
  truncated: false,
};

describe('ComissoesPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(commissionService, 'report').mockResolvedValue(report);
    vi.spyOn(professionalService, 'listActive').mockResolvedValue([]);
  });

  it('admin vê o filtro de profissional e os valores formatados', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'admin' }, 'admin');
    renderWithProviders(<ComissoesPage />);
    expect(await screen.findByRole('combobox', { name: 'Profissional' })).toBeInTheDocument();
    expect(await screen.findAllByText(/R\$\s*61,00/)).toHaveLength(2);
    expect(screen.getByText(/^40% \+ R\$\s5,00$/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Baixar CSV/ })).toBeInTheDocument();
  });

  it('manicure não tem filtro de profissional e consulta sem professionalId', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'manicure', professionalId: 'p1' }, 'manicure');
    renderWithProviders(<ComissoesPage />);
    expect(await screen.findByText('Minhas comissões')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Profissional' })).not.toBeInTheDocument();
    expect(commissionService.report).toHaveBeenCalledWith(expect.objectContaining({ professionalId: undefined }));
  });

  it('avisa quando a lista foi truncada e baixa o CSV com o mesmo período', async () => {
    vi.spyOn(commissionService, 'report').mockResolvedValue({ ...report, truncated: true });
    const download = vi.spyOn(commissionService, 'downloadCsv').mockResolvedValue();
    useAuthStore.getState().setAuth({ ...user, role: 'admin' }, 'admin');
    const { user: u } = renderWithProviders(<ComissoesPage />);
    expect(await screen.findByText(/primeiros 2.000 itens/)).toBeInTheDocument();
    await u.click(screen.getByRole('button', { name: /Baixar CSV/ }));
    expect(download).toHaveBeenCalledWith(expect.objectContaining({ from: expect.any(String), to: expect.any(String) }));
  });

  it('regra da comissão', () => {
    expect(commissionRule({ rate: 40, fixed: null })).toBe('40%');
    expect(commissionRule({ rate: null, fixed: null })).toBe('—');
  });
});
