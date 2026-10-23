import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { useAuthStore } from '@/stores/auth.store';
import { PatientFormFields } from '../components/PatientFormFields';
import { patientService } from '../services/patient.service';
import { INITIAL_PATIENT_FORM } from '../constants';
import type { Patient } from '@/types';

const user = { id: 'u', username: 'rec', professionalName: null, professionalId: null, workdayStart: '08:00', workdayEnd: '18:00' };

describe('PatientFormFields', () => {
  it('avisa quando o celular já pertence a outra cliente e oferece abrir a ficha', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'recepcao' }, 'recepcao');
    const spy = vi.spyOn(patientService, 'findByPhone').mockResolvedValue({ id: 'p1', fullName: 'Maria Silva' } as Patient);

    renderWithProviders(
      <PatientFormFields form={{ ...INITIAL_PATIENT_FORM, phoneNumber: '(12) 98803-6103' }} mode="create" onChange={() => undefined} />,
    );
    fireEvent.blur(screen.getByLabelText(/Celular/));

    expect(await screen.findByRole('alert')).toHaveTextContent('Maria Silva');
    expect(screen.getByRole('link', { name: 'Abrir ficha' })).toHaveAttribute('href', '/pacientes/p1');
    expect(spy).toHaveBeenCalledWith('12988036103');
  });

  it('CPF fica em "Mais dados" e o consentimento LGPD aparece só no cadastro', () => {
    useAuthStore.getState().setAuth({ ...user, role: 'admin' }, 'admin');
    const { unmount } = renderWithProviders(<PatientFormFields form={INITIAL_PATIENT_FORM} mode="create" onChange={() => undefined} />);
    expect(screen.getByLabelText('CPF')).not.toBeRequired();
    expect(screen.getByLabelText(/LGPD/)).toBeInTheDocument();
    unmount();
    renderWithProviders(<PatientFormFields form={INITIAL_PATIENT_FORM} mode="edit" currentPatientId="p1" onChange={() => undefined} />);
    expect(screen.queryByLabelText(/LGPD/)).not.toBeInTheDocument();
  });
});
