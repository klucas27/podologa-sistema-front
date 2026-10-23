import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { TimeSlotGrid } from '../components/TimeSlotGrid';

describe('TimeSlotGrid', () => {
  it('lista horários com alvo de 44 px e devolve o horário tocado', () => {
    const onSelect = vi.fn();
    renderWithProviders(<TimeSlotGrid slots={['10:00', '11:00']} onSelect={onSelect} />);
    const button = screen.getByRole('button', { name: '10:00' });
    expect(button.className).toContain('min-h-11');
    expect(button.className).toContain('min-w-11');
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith('10:00');
  });

  it('avisa quando o dia não tem horário livre', () => {
    renderWithProviders(<TimeSlotGrid slots={[]} onSelect={vi.fn()} />);
    expect(screen.getByText('Nenhum horário livre neste dia.')).toBeInTheDocument();
  });
});
