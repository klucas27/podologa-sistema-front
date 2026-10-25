import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '@/test/test-utils';
import { useAuthStore } from '@/stores/auth.store';
import ProntuarioPage from '../pages/ProntuarioPage';
import { patientService } from '../services/patient.service';
import { anamnesisService } from '@/features/anamneses/services/anamnesis.service';
import { appointmentService } from '@/features/appointments/services/appointment.service';
import type { Patient, UserRole } from '@/types';

const user = { id: 'u', username: 'u', professionalName: null, professionalId: 'p1', workdayStart: '08:00', workdayEnd: '18:00' };

function renderAs(role: UserRole) {
  useAuthStore.getState().setAuth({ ...user, role }, role);
  return renderWithProviders(
    <Routes><Route path="/pacientes/:id" element={<ProntuarioPage />} /></Routes>,
    { routerProps: { initialEntries: ['/pacientes/c1'] } },
  );
}

describe('ProntuarioPage', () => {
  let anamnesisSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(patientService, 'getById').mockResolvedValue({ id: 'c1', fullName: 'Maria Silva', cpf: null, phoneNumber: '(12) 98803-6103' } as Patient);
    vi.spyOn(appointmentService, 'listByPatient').mockResolvedValue([]);
    anamnesisSpy = vi.spyOn(anamnesisService, 'getByPatientId').mockResolvedValue([]);
  });

  it('manicure não vê a aba Saúde nem busca anamnese', async () => {
    renderAs('manicure');
    expect(await screen.findByRole('tab', { name: 'Dados' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Saúde' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Anamnese/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar Cliente/ })).not.toBeInTheDocument();
    expect(anamnesisSpy).not.toHaveBeenCalled();
  });

  it('podóloga vê a aba Saúde', async () => {
    renderAs('podologa');
    expect(await screen.findByRole('tab', { name: 'Saúde' })).toBeInTheDocument();
    expect(anamnesisSpy).toHaveBeenCalledWith('c1');
  });
});
