import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { PendingRequestCard } from '../components/PendingRequestCard';

const props = {
  patientName: 'Maria Pedidos',
  phone: '(12) 98803-6103',
  serviceName: 'Manicure',
  professionalName: 'Ana',
  when: '01/12/2026 10:00',
  sourceLabel: 'Link',
};

describe('PendingRequestCard', () => {
  it('mostra cliente, telefone, serviço, profissional, horário e origem', () => {
    renderWithProviders(<PendingRequestCard {...props} onConfirm={vi.fn()} onDecline={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Maria Pedidos' })).toBeInTheDocument();
    expect(screen.getByText('(12) 98803-6103')).toBeInTheDocument();
    expect(screen.getByText('Manicure')).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('01/12/2026 10:00')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' }).className).toContain('min-h-11');
  });

  it('confirmar chama a ação na hora', () => {
    const onConfirm = vi.fn();
    renderWithProviders(<PendingRequestCard {...props} onConfirm={onConfirm} onDecline={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('recusar só segue depois da confirmação', () => {
    const onDecline = vi.fn();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    renderWithProviders(<PendingRequestCard {...props} onConfirm={vi.fn()} onDecline={onDecline} />);
    fireEvent.click(screen.getByRole('button', { name: 'Recusar' }));
    expect(onDecline).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Recusar' }));
    expect(onDecline).toHaveBeenCalledOnce();
    confirm.mockRestore();
  });
});
