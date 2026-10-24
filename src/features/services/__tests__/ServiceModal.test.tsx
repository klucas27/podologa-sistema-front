import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { ServiceModal } from '../components/ServiceModal';
import { buildServiceBody } from '../hooks/useServicosPage';
import type { ServiceForm } from '../hooks/useServicosPage';
import { stockService } from '@/features/stock/services/stock.service';

const base: ServiceForm = {
  name: 'Gel', category: 'estetica', durationMinutes: '90', price: '90', commissionRate: '40',
  commissionMode: 'percent', commissionFixed: '', requiresAnamnesis: false, isPublic: true, isActive: true, products: [],
};

const Harness: React.FC = () => {
  const [form, setForm] = useState(base);
  return <ServiceModal editingId={null} form={form} setForm={setForm} isSaving={false} formError="" onSave={(e) => e.preventDefault()} onClose={() => {}} />;
};

describe('ServiceModal — comissão e ficha técnica', () => {
  beforeEach(() => {
    vi.spyOn(stockService, 'listProducts').mockResolvedValue([
      { id: 'p1', name: 'Gel base', brand: null, category: null, unit: 'ml', minQuantity: 0, isActive: true, balance: 10, nextExpiry: null },
    ]);
  });

  it('valor fixo aparece só nos modos fixo e percentual + fixo', async () => {
    renderWithProviders(<Harness />);
    expect(screen.queryByLabelText(/Valor fixo/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Taxa padrão (%)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Valor fixo' }));
    expect(screen.getByLabelText(/Valor fixo \(R\$\)/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Taxa padrão (%)')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Percentual + fixo' }));
    expect(screen.getByLabelText(/Valor fixo \(R\$\)/)).toBeInTheDocument();
    expect(screen.getByLabelText('Taxa padrão (%)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Adicionar produto/ }));
    expect(await screen.findByRole('option', { name: 'Gel base' })).toBeInTheDocument();
  });

  it('validação: fixo obrigatório nos modos com valor fixo; produtos com quantidade', () => {
    expect(buildServiceBody({ ...base, commissionMode: 'fixed' })).toEqual({ error: 'Informe o valor fixo da comissão.' });
    const ok = buildServiceBody({ ...base, commissionMode: 'percent_plus_fixed', commissionFixed: '5,50', products: [{ productId: 'p1', quantity: '1,5' }] });
    expect(ok).toMatchObject({ body: { commissionMode: 'percent_plus_fixed', commissionRate: 40, commissionFixed: 5.5 }, items: [{ productId: 'p1', quantity: 1.5 }] });
    expect(buildServiceBody({ ...base, products: [{ productId: 'p1', quantity: '0' }] })).toEqual({ error: 'Quantidade do produto deve ser maior que zero.' });
    expect(buildServiceBody({ ...base, commissionFixed: '9' })).toMatchObject({ body: { commissionFixed: null } });
  });
});
