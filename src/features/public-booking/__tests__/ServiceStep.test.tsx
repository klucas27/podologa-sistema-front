import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { ServiceStep } from '../components/ServiceStep';

describe('ServiceStep', () => {
  it('mostra nome, duração e preço e devolve o serviço escolhido', () => {
    const onSelect = vi.fn();
    renderWithProviders(
      <ServiceStep
        services={[{ id: 'srv', name: 'Manicure', category: 'estetica', durationMinutes: 60, price: 35 }]}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByRole('button', { name: /Manicure/ })).toHaveTextContent('60 min');
    expect(screen.getByRole('button', { name: /Manicure/ })).toHaveTextContent('R$');
    expect(screen.getByRole('button', { name: /Manicure/ })).toHaveTextContent('35,00');
    fireEvent.click(screen.getByRole('button', { name: /Manicure/ }));
    expect(onSelect).toHaveBeenCalledWith('srv');
  });
});
