import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import ScheduleBlocksTab from '../components/ScheduleBlocksTab';
import { settingsService } from '../services/settings.service';
import { professionalService } from '@/features/professionals/services/professional.service';
import { ApiError } from '@/lib/api';

describe('ScheduleBlocksTab', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(professionalService, 'listActive').mockResolvedValue([]);
  });

  it('lista bloqueios existentes', async () => {
    vi.spyOn(settingsService, 'listBlocks').mockResolvedValue([
      { id: 'b1', professionalId: null, startAt: '2027-03-02T12:00:00.000Z', endAt: '2027-03-02T13:00:00.000Z', reason: 'almoço' },
    ]);
    renderWithProviders(<ScheduleBlocksTab />);
    expect(await screen.findByText(/Salão todo · almoço/)).toBeInTheDocument();
    expect(screen.getByText(/12:00–13:00/)).toBeInTheDocument();
  });

  it('409 mostra os horários em conflito', async () => {
    vi.spyOn(settingsService, 'listBlocks').mockResolvedValue([]);
    vi.spyOn(settingsService, 'createBlock').mockRejectedValue(
      new ApiError(409, 'Há agendamentos neste período', { conflicts: [{ date: '2027-03-02', start: '15:00', end: '16:00' }] }),
    );
    renderWithProviders(<ScheduleBlocksTab />);
    fireEvent.click(await screen.findByRole('button', { name: 'Bloquear horário' }));
    expect(await screen.findByText('Há agendamentos neste período')).toBeInTheDocument();
    expect(screen.getByText(/das 15:00 às 16:00/)).toBeInTheDocument();
  });
});
