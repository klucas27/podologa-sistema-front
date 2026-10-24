import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { useAuthStore } from '@/stores/auth.store';
import DashboardPage from '../pages/DashboardPage';
import { kpiService } from '../services/kpi.service';
import { dashboardService } from '../services/dashboard.service';
import { professionalService } from '@/features/professionals/services/professional.service';
import { bookingRequestService } from '@/features/booking-requests/services/bookingRequest.service';
import { kpis } from './fixtures';

const user = { id: 'u', username: 'u', professionalName: null, professionalId: null, workdayStart: '08:00', workdayEnd: '18:00' };

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.spyOn(kpiService, 'get').mockResolvedValue(kpis);
    vi.spyOn(professionalService, 'listActive').mockResolvedValue([]);
    vi.spyOn(bookingRequestService, 'listPending').mockResolvedValue([]);
  });

  it('manicure vê os próprios indicadores sem filtro de profissional nem painel antigo', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'manicure', professionalId: 'p1' }, 'manicure');
    const legacy = vi.spyOn(dashboardService, 'getData');
    renderWithProviders(<DashboardPage />);
    expect(await screen.findByText('Meus indicadores')).toBeInTheDocument();
    expect(await screen.findByText('Ticket médio')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Profissional' })).not.toBeInTheDocument();
    expect(screen.queryByText('Visão geral')).not.toBeInTheDocument();
    expect(legacy).not.toHaveBeenCalled();
    expect(kpiService.get).toHaveBeenCalledWith(expect.objectContaining({ professionalId: undefined }));
  });

  it('recepção tem filtro de profissional e alertas', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'recepcao' }, 'recepcao');
    renderWithProviders(<DashboardPage />);
    expect(await screen.findByRole('combobox', { name: 'Profissional' })).toBeInTheDocument();
    expect(await screen.findByText('lotes vencendo em 30 dias')).toBeInTheDocument();
  });

  it('avisa quando o período é longo demais para a ocupação', async () => {
    vi.spyOn(kpiService, 'get').mockResolvedValue({ ...kpis, occupancy: null, warnings: ['occupancy_period_too_long'] });
    useAuthStore.getState().setAuth({ ...user, role: 'recepcao' }, 'recepcao');
    renderWithProviders(<DashboardPage />);
    expect(await screen.findByText(/até 92 dias/)).toBeInTheDocument();
  });
});
