import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { useAuthStore } from '@/stores/auth.store';
import ServicosPage from '../pages/ServicosPage';
import { serviceService } from '../services/service.service';
import type { Service } from '@/types';

const services: Service[] = [
  { id: 's1', name: 'Manicure', category: 'estetica', durationMinutes: 45, price: 35, commissionRate: null, requiresAnamnesis: false, isPublic: true, isActive: true, createdAt: '', updatedAt: '' },
  { id: 's2', name: 'Avaliação podológica', category: 'podologia', durationMinutes: 60, price: 120, commissionRate: 30, requiresAnamnesis: true, isPublic: false, isActive: true, createdAt: '', updatedAt: '' },
];

const user = { id: 'u', username: 'u', professionalName: null, professionalId: null, workdayStart: '08:00', workdayEnd: '18:00' };

describe('ServicosPage', () => {
  beforeEach(() => {
    vi.spyOn(serviceService, 'list').mockResolvedValue(services);
  });

  it('lista serviços com duração, preço e indicação do link', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'admin' }, 'admin');
    renderWithProviders(<ServicosPage />);
    expect(await screen.findByText('Manicure')).toBeInTheDocument();
    expect(screen.getByText('45 min')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?120,00/)).toBeInTheDocument();
    expect(screen.getAllByText('no link')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Novo serviço' })).toBeInTheDocument();
  });

  it('recepção vê a lista sem ações de edição', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'recepcao' }, 'recepcao');
    renderWithProviders(<ServicosPage />);
    expect(await screen.findByText('Manicure')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Novo serviço' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
  });
});
