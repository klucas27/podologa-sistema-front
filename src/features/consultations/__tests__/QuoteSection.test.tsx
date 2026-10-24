import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import QuoteSection from '../components/QuoteSection';
import { quoteService } from '../services/quote.service';
import type { Quote } from '../services/quote.service';

const quote: Quote = { id: 'q1', appointmentId: 'a1', amount: 240, description: '4 sessões', status: 'pending', createdAt: '', updatedAt: '' };

describe('QuoteSection', () => {
  it('podóloga cria orçamento aceito', async () => {
    vi.spyOn(quoteService, 'getByAppointment').mockResolvedValue(null);
    const create = vi.spyOn(quoteService, 'create').mockResolvedValue({ ...quote, status: 'accepted' });
    renderWithProviders(<QuoteSection appointmentId="a1" canEdit />);
    fireEvent.change(await screen.findByLabelText('Valor proposto (R$) *'), { target: { value: '240,50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aceito' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar orçamento' }));
    await waitFor(() => expect(create).toHaveBeenCalledWith('a1', { amount: 240.5, description: null, status: 'accepted' }));
  });

  it('carrega o existente e atualiza; valor obrigatório', async () => {
    vi.spyOn(quoteService, 'getByAppointment').mockResolvedValue(quote);
    const update = vi.spyOn(quoteService, 'update').mockResolvedValue(quote);
    renderWithProviders(<QuoteSection appointmentId="a1" canEdit />);
    const input = await screen.findByDisplayValue('240');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar orçamento' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Informe o valor do orçamento.');
    fireEvent.change(input, { target: { value: '300' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar orçamento' }));
    await waitFor(() => expect(update).toHaveBeenCalledWith('q1', { amount: 300, description: '4 sessões', status: 'pending' }));
  });

  it('recepção só lê', async () => {
    vi.spyOn(quoteService, 'getByAppointment').mockResolvedValue(quote);
    renderWithProviders(<QuoteSection appointmentId="a1" canEdit={false} />);
    expect(await screen.findByText(/R\$\s?240,00 · Pendente/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /orçamento/ })).not.toBeInTheDocument();
  });
});
