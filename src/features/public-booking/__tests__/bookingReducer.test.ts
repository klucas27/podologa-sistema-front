import { describe, expect, it } from 'vitest';
import {
  RATE_LIMIT_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  bookingReducer,
  initialBookingState,
  type BookingConfirmation,
  type BookingState,
} from '../hooks/usePublicBooking';

const confirmation: BookingConfirmation = {
  bookingId: 'b1',
  status: 'pending',
  serviceName: 'Manicure',
  professionalFirstName: 'Ana',
  start: '2026-11-02T10:00',
  end: '2026-11-02T11:00',
  address: 'Rua A, 1',
  manageToken: 'tok',
};

function go(state: BookingState, ...actions: Parameters<typeof bookingReducer>[1][]): BookingState {
  return actions.reduce(bookingReducer, state);
}

describe('bookingReducer', () => {
  it('celular cadastrado vai para a saudação; celular novo vai para o cadastro', () => {
    const known = bookingReducer(initialBookingState, { type: 'IDENTIFIED', registered: true, firstName: 'Maria' });
    expect(known.step).toBe('greeting');
    expect(known.firstName).toBe('Maria');

    const unknown = bookingReducer(initialBookingState, { type: 'IDENTIFIED', registered: false });
    expect(unknown.step).toBe('register');
    expect(unknown.firstName).toBeNull();
  });

  it('cadastro concluído chega na saudação e Continuar abre o serviço', () => {
    const greeting = go(
      initialBookingState,
      { type: 'IDENTIFIED', registered: false },
      { type: 'REGISTERED', firstName: 'Joana' },
    );
    expect(greeting).toMatchObject({ step: 'greeting', firstName: 'Joana' });
    expect(bookingReducer(greeting, { type: 'CONTINUE' }).step).toBe('service');
  });

  it('serviço, profissional, data e horário seguem nessa ordem', () => {
    const service = go(
      initialBookingState,
      { type: 'IDENTIFIED', registered: true, firstName: 'Maria' },
      { type: 'CONTINUE' },
    );
    const professional = bookingReducer(service, { type: 'SELECT_SERVICE', serviceId: 'srv' });
    const date = bookingReducer(professional, { type: 'SELECT_PROFESSIONAL', professionalId: null });
    const time = bookingReducer(date, { type: 'SELECT_DATE', date: '2026-11-02' });
    const chosen = bookingReducer(time, { type: 'SELECT_TIME', time: '10:00' });
    const done = bookingReducer(chosen, { type: 'CONFIRMED', confirmation });

    expect(professional).toMatchObject({ step: 'professional', serviceId: 'srv' });
    expect(date).toMatchObject({ step: 'date', professionalId: null, professionalChosen: true });
    expect(time).toMatchObject({ step: 'time', date: '2026-11-02', time: null });
    expect(chosen.time).toBe('10:00');
    expect(done).toMatchObject({ step: 'confirmation', confirmation });
  });

  it('409 volta aos horários com aviso e 401 volta ao celular', () => {
    const time = go(
      initialBookingState,
      { type: 'IDENTIFIED', registered: true, firstName: 'Maria' },
      { type: 'CONTINUE' },
      { type: 'SELECT_SERVICE', serviceId: 'srv' },
      { type: 'SELECT_PROFESSIONAL', professionalId: 'ana' },
      { type: 'SELECT_DATE', date: '2026-11-02' },
      { type: 'SELECT_TIME', time: '10:00' },
    );
    const conflict = bookingReducer(time, { type: 'CONFLICT', message: 'Esse horário acabou de ser ocupado.' });
    expect(conflict).toMatchObject({ step: 'time', time: null, notice: 'Esse horário acabou de ser ocupado.' });

    const expired = bookingReducer(conflict, { type: 'SESSION_EXPIRED' });
    expect(expired).toMatchObject({ step: 'phone', firstName: null, serviceId: null, notice: SESSION_EXPIRED_MESSAGE });
  });

  it('429 guarda o aviso e ações fora de ordem não mudam o passo', () => {
    const limited = bookingReducer(initialBookingState, { type: 'RATE_LIMITED' });
    expect(limited.notice).toBe(RATE_LIMIT_MESSAGE);
    expect(limited.step).toBe('phone');
    expect(bookingReducer(initialBookingState, { type: 'SELECT_SERVICE', serviceId: 'srv' })).toBe(initialBookingState);
    expect(bookingReducer(initialBookingState, { type: 'CONFIRMED', confirmation })).toBe(initialBookingState);
  });

  it('voltar desfaz um passo e limpa o aviso', () => {
    const register = bookingReducer(
      { ...initialBookingState, step: 'register', notice: 'algo' },
      { type: 'BACK' },
    );
    expect(register).toMatchObject({ step: 'phone', notice: null });
    expect(bookingReducer(initialBookingState, { type: 'BACK' })).toBe(initialBookingState);
  });
});
