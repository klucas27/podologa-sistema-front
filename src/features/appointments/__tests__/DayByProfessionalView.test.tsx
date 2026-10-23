import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import DayByProfessionalView from '../components/DayByProfessionalView';
import type { Appointment } from '@/types';

const appt = (id: string, professionalId: string, status: Appointment['status'], name: string): Appointment => ({
  id, patientId: 'p', userId: 'u', professionalId, serviceId: 's1', priceCharged: 35, source: 'balcao',
  confirmedAt: null, cancelledAt: null, rescheduledFromId: null,
  scheduledStart: '2026-11-04T10:00:00.000Z', scheduledEnd: '2026-11-04T10:45:00.000Z', scheduledDate: '2026-11-04',
  actualStartTime: null, actualEndTime: null, status, notes: null, createdAt: '', updatedAt: '',
  patient: { fullName: name } as Appointment['patient'],
});

describe('DayByProfessionalView', () => {
  const props = {
    isToday: false,
    columns: [{ id: 'ana', name: 'Ana' }, { id: 'bia', name: 'Bia' }],
    appointments: [appt('a1', 'ana', 'scheduled', 'Maria'), appt('a2', 'bia', 'pending', 'Joana')],
    hours: [9, 10, 11],
    hourStart: 9,
    hourEnd: 12,
    categoryOf: () => 'estetica' as const,
    serviceNameOf: () => 'Manicure',
    getApptStyle: () => ({ top: '60px', height: '45px' }),
    onAppointmentClick: vi.fn(),
  };

  it('mostra atendimentos simultâneos em colunas das respectivas profissionais', () => {
    const { container } = render(<DayByProfessionalView {...props} onSlotClick={vi.fn()} />);
    const ana = container.querySelector('[data-professional="ana"]') as HTMLElement;
    const bia = container.querySelector('[data-professional="bia"]') as HTMLElement;
    expect(within(ana).getByText('Maria')).toBeInTheDocument();
    expect(within(bia).getByText('Joana')).toBeInTheDocument();
    expect(within(bia).getByText(/aguardando confirmação/)).toBeInTheDocument();
    expect(within(ana).queryByText('Joana')).not.toBeInTheDocument();
  });

  it('toque num horário vazio agenda com a profissional da coluna', () => {
    const onSlotClick = vi.fn();
    render(<DayByProfessionalView {...props} onSlotClick={onSlotClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Agendar com Bia às 11:00' }));
    expect(onSlotClick).toHaveBeenCalledWith('bia', 11);
  });
});
