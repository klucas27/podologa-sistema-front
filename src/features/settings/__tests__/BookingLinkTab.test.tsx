import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { ApiError } from '@/lib/api';
import type { BusinessSettings } from '@/types';
import { settingsService } from '../services/settings.service';
import BookingLinkTab from '../components/BookingLinkTab';

vi.mock('qrcode', () => ({
  toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,qr'),
}));

vi.mock('../services/settings.service', () => ({
  settingsService: {
    getBusiness: vi.fn(),
    updateBusiness: vi.fn(),
  },
}));

const business: BusinessSettings = {
  businessName: 'Nálu Nails',
  slug: 'nalu-nails',
  address: 'Rua das Flores, 10',
  phoneDisplay: '(12) 98800-0000',
  onlineBookingEnabled: true,
  autoConfirmOnlineBooking: false,
  minAdvanceMinutes: 120,
  maxAdvanceDays: 30,
  slotStepMinutes: 15,
  minCancelHours: 6,
  maxPendingPerPhone: 2,
  consentText: 'Autorizo o uso do meu nome e telefone para agendamento.',
  consentVersion: 'v1',
};

describe('BookingLinkTab', () => {
  beforeEach(() => {
    vi.mocked(settingsService.getBusiness).mockResolvedValue(business);
    vi.mocked(settingsService.updateBusiness).mockResolvedValue(business);
  });

  it('carrega os dados do salão', async () => {
    renderWithProviders(<BookingLinkTab />);
    expect(await screen.findByLabelText('Nome do salão')).toHaveValue('Nálu Nails');
    expect(screen.getByLabelText('Endereço do link')).toHaveValue('nalu-nails');
    expect(screen.getByLabelText('Antecedência mínima (horas)')).toHaveValue(2);
    expect(screen.getByLabelText('Ativar link')).toBeChecked();
    expect(screen.getByLabelText('Auto-confirmar')).not.toBeChecked();
    expect(await screen.findByRole('img', { name: 'QR code de Nálu Nails' })).toHaveAttribute('src', 'data:image/png;base64,qr');
  });

  it('valida o slug antes de salvar', async () => {
    const { user } = renderWithProviders(<BookingLinkTab />);
    const slug = await screen.findByLabelText('Endereço do link');
    await user.clear(slug);
    await user.type(slug, 'AB');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('Use letras minúsculas, números e hífen (3 a 60).')).toBeInTheDocument();
    expect(settingsService.updateBusiness).not.toHaveBeenCalled();
  });

  it('monta o link público com o slug', async () => {
    const { user } = renderWithProviders(<BookingLinkTab />);
    const link = await screen.findByLabelText('Link completo');
    expect(link).toHaveValue(`${window.location.origin}/agendar/nalu-nails`);
    const slug = screen.getByLabelText('Endereço do link');
    await user.clear(slug);
    await user.type(slug, 'salao-centro');
    expect(screen.getByLabelText('Link completo')).toHaveValue(`${window.location.origin}/agendar/salao-centro`);
  });

  it('mostra o endereço em uso quando o slug responde 409', async () => {
    vi.mocked(settingsService.updateBusiness).mockRejectedValueOnce(new ApiError(409, 'conflito'));
    const { user } = renderWithProviders(<BookingLinkTab />);
    await screen.findByLabelText('Nome do salão');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Este endereço já está em uso')).toBeInTheDocument();
  });

  it('seleciona o link quando a área de transferência falha', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('negado'));
    const { user } = renderWithProviders(<BookingLinkTab />);
    await screen.findByLabelText('Link completo');
    const select = vi.spyOn(HTMLInputElement.prototype, 'select').mockImplementation(() => undefined);
    await user.click(screen.getByRole('button', { name: 'Copiar' }));
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/agendar/nalu-nails`);
    expect(select).toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Copie manualmente');
    select.mockRestore();
  });
});
