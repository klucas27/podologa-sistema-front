import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { SlotPicker } from '../components/SlotPicker';

describe('SlotPicker', () => {
  it('lista os inícios do dia com alvo de 44 px e preenche o horário tocado', () => {
    const onSelect = vi.fn();
    renderWithProviders(
      <SlotPicker slots={['10:00', '11:00']} selected="" onSelect={onSelect} />,
    );
    const button = screen.getByRole('button', { name: '10:00' });
    expect(button.className).toContain('min-h-11');
    expect(button.className).toContain('min-w-11');
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith('10:00');
  });

  it('destaca o horário já escolhido', () => {
    renderWithProviders(
      <SlotPicker slots={['10:00', '11:00']} selected="11:00" onSelect={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: '11:00' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '10:00' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('avisa quando o dia não tem horário livre', () => {
    renderWithProviders(<SlotPicker slots={[]} selected="" onSelect={vi.fn()} />);
    expect(screen.getByText('Nenhum horário livre neste dia.')).toBeInTheDocument();
  });
});
