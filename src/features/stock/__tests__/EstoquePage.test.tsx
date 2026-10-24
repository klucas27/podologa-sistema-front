import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { useAuthStore } from '@/stores/auth.store';
import EstoquePage from '../pages/EstoquePage';
import { stockService } from '../services/stock.service';
import type { Product, StockAlertsData } from '../services/stock.service';

const products: Product[] = [
  { id: 'p1', name: 'Acetona', brand: null, category: null, unit: 'ml', minQuantity: 500, isActive: true, balance: 1250.5, nextExpiry: '2099-01-10T00:00:00.000Z' },
  { id: 'p2', name: 'Gel base', brand: 'Vólia', category: null, unit: 'ml', minQuantity: 50, isActive: true, balance: 20, nextExpiry: '2000-01-01T00:00:00.000Z' },
];

const alerts: StockAlertsData = {
  expiring: [{ batchId: 'b1', productId: 'p2', name: 'Gel base', unit: 'ml', quantity: 20, expiryDate: '2000-01-01T00:00:00.000Z' }],
  belowMin: [{ productId: 'p2', name: 'Gel base', unit: 'ml', minQuantity: 50, balance: 20 }],
  shortages: [],
};

const user = { id: 'u', username: 'u', professionalName: null, professionalId: null, workdayStart: '08:00', workdayEnd: '18:00' };

describe('EstoquePage', () => {
  beforeEach(() => {
    vi.spyOn(stockService, 'listProducts').mockResolvedValue(products);
    vi.spyOn(stockService, 'alerts').mockResolvedValue(alerts);
  });

  it('manicure vê só "Registrar saída"', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'manicure', professionalId: 'pr' }, 'manicure');
    renderWithProviders(<EstoquePage />);
    expect(await screen.findByText('Acetona')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Registrar saída/ })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /Entrada/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Novo produto' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Descartar' })).not.toBeInTheDocument();
  });

  it('admin vê alertas, saldo e ações de gestão', async () => {
    useAuthStore.getState().setAuth({ ...user, role: 'admin' }, 'admin');
    renderWithProviders(<EstoquePage />);
    expect(await screen.findByRole('region', { name: 'Vencendo em 30 dias' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Abaixo do mínimo' })).toHaveTextContent('Gel base');
    expect(await screen.findByText('Saldo 1.250,5 ml')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descartar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Novo produto' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Entrada de/ })).toHaveLength(2);
  });
});
