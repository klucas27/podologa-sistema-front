import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test/test-utils';
import { useAuthStore } from '@/stores/auth.store';
import ConsultationExecutionPage from '../pages/ConsultationExecutionPage';
import { consultationService } from '../services/consultation.service';
import { serviceService } from '@/features/services/services/service.service';
import type { Appointment, AppointmentStatus, Service } from '@/types';

const service: Service = {
  id: 's1', name: 'Manicure', category: 'estetica', durationMinutes: 45, price: 35, commissionRate: null,
  commissionMode: 'percent', commissionFixed: null, requiresAnamnesis: false, isPublic: true, isActive: true, createdAt: '', updatedAt: '',
};

const appointment = (status: AppointmentStatus): Appointment => ({
  id: 'a1', patientId: 'p1', userId: 'u', professionalId: 'm1', serviceId: 's1', priceCharged: 35, source: 'balcao',
  confirmedAt: null, cancelledAt: null, rescheduledFromId: null, scheduledStart: '2026-10-24T10:00:00.000Z',
  scheduledEnd: '2026-10-24T10:45:00.000Z', scheduledDate: '2026-10-24', actualStartTime: null, actualEndTime: null,
  status, notes: null, createdAt: '', updatedAt: '',
});

const user = { id: 'u', username: 'u', professionalName: null, professionalId: null, workdayStart: '08:00', workdayEnd: '18:00' };

function renderPage() {
  return renderWithProviders(
    <Routes><Route path="/consultas/:appointmentId" element={<ConsultationExecutionPage />} /></Routes>,
    { routerProps: { initialEntries: ['/consultas/a1'] } },
  );
}

describe('ConsultationExecutionPage — estética', () => {
  beforeEach(() => {
    vi.spyOn(serviceService, 'list').mockResolvedValue([service]);
    vi.spyOn(serviceService, 'listProducts').mockResolvedValue([{ productId: 'pr1', name: 'Acetona', unit: 'ml', quantity: 5 }]);
    vi.spyOn(consultationService, 'getEvolutions').mockResolvedValue([]);
    vi.spyOn(consultationService, 'listPathologies').mockResolvedValue([]);
  });

  it('manicure vê encaminhar e produtos, não vê cobrança nem evolução', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'manicure', professionalId: 'm1' }, 'manicure');
    vi.spyOn(consultationService, 'getAppointment').mockResolvedValue(appointment('in_progress'));
    const billings = vi.spyOn(consultationService, 'getBillings').mockResolvedValue([]);
    renderPage();
    expect(await screen.findByRole('button', { name: 'Encaminhar à podóloga' })).toBeInTheDocument();
    expect(await screen.findByText('Acetona')).toBeInTheDocument();
    expect(screen.queryByText(/Cobrança/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Evolução/)).not.toBeInTheDocument();
    expect(billings).not.toHaveBeenCalled();
  });

  it('manicure após finalizar vê aviso de pagamento na recepção', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'manicure', professionalId: 'm1' }, 'manicure');
    vi.spyOn(consultationService, 'getAppointment').mockResolvedValue(appointment('completed'));
    renderPage();
    expect(await screen.findByText(/aguardando pagamento na recepção/)).toBeInTheDocument();
  });

  it('recepção vê cobrança e não encaminha', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'recepcao' }, 'recepcao');
    vi.spyOn(consultationService, 'getAppointment').mockResolvedValue(appointment('completed'));
    vi.spyOn(consultationService, 'getBillings').mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText(/Cobrança/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Encaminhar à podóloga' })).not.toBeInTheDocument();
    expect(screen.queryByText(/aguardando pagamento/)).not.toBeInTheDocument();
  });
});
