import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { PhoneStep } from '../components/PhoneStep';

describe('PhoneStep', () => {
  it('mascara o celular e envia só os dígitos normalizados', () => {
    const onSubmit = vi.fn();
    renderWithProviders(<PhoneStep onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Celular'), { target: { value: '12988036103' } });
    expect(screen.getByLabelText('Celular')).toHaveValue('(12) 98803-6103');

    fireEvent.submit(screen.getByLabelText('Celular').closest('form')!);
    expect(onSubmit).toHaveBeenCalledWith('12988036103');
  });

  it('não envia celular sem DDD', () => {
    const onSubmit = vi.fn();
    renderWithProviders(<PhoneStep onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Celular'), { target: { value: '988036103' } });
    fireEvent.submit(screen.getByLabelText('Celular').closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Informe o celular com DDD.')).toBeInTheDocument();
  });
});
