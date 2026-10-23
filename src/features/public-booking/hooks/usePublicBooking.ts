import { useReducer, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PublicApiError } from '@/lib/publicApi';
import { publicBookingService, type RegisterInput } from '../services/publicBooking.service';

export type BookingStep =
  | 'phone'
  | 'register'
  | 'greeting'
  | 'service'
  | 'professional'
  | 'date'
  | 'time'
  | 'confirmation';

export interface BookingConfirmation {
  bookingId: string;
  status: string;
  serviceName: string;
  professionalFirstName: string;
  start: string;
  end: string;
  address: string | null;
  manageToken: string;
}

export interface BookingState {
  step: BookingStep;
  firstName: string | null;
  serviceId: string | null;
  /** `null` com `professionalChosen` = "Sem preferência". */
  professionalId: string | null;
  professionalChosen: boolean;
  date: string | null;
  time: string | null;
  notice: string | null;
  confirmation: BookingConfirmation | null;
}

export const initialBookingState: BookingState = {
  step: 'phone',
  firstName: null,
  serviceId: null,
  professionalId: null,
  professionalChosen: false,
  date: null,
  time: null,
  notice: null,
  confirmation: null,
};

export const RATE_LIMIT_MESSAGE = 'Muitas tentativas, aguarde alguns minutos';
export const SESSION_EXPIRED_MESSAGE = 'Sua sessão expirou. Informe o celular novamente.';

export type BookingAction =
  | { type: 'IDENTIFIED'; registered: true; firstName: string }
  | { type: 'IDENTIFIED'; registered: false }
  | { type: 'REGISTERED'; firstName: string }
  | { type: 'CONTINUE' }
  | { type: 'SELECT_SERVICE'; serviceId: string }
  | { type: 'SELECT_PROFESSIONAL'; professionalId: string | null }
  | { type: 'SELECT_DATE'; date: string }
  | { type: 'SELECT_TIME'; time: string }
  | { type: 'CONFIRMED'; confirmation: BookingConfirmation }
  | { type: 'CONFLICT'; message: string }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'RATE_LIMITED' }
  | { type: 'NOTICE'; message: string }
  | { type: 'BACK' };

const BACK: Partial<Record<BookingStep, BookingStep>> = {
  register: 'phone',
  greeting: 'phone',
  service: 'greeting',
  professional: 'service',
  date: 'professional',
  time: 'date',
};

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'IDENTIFIED':
      if (state.step !== 'phone') return state;
      return action.registered
        ? { ...initialBookingState, step: 'greeting', firstName: action.firstName }
        : { ...initialBookingState, step: 'register' };
    case 'REGISTERED':
      if (state.step !== 'register') return state;
      return { ...state, step: 'greeting', firstName: action.firstName, notice: null };
    case 'CONTINUE':
      if (state.step !== 'greeting') return state;
      return { ...state, step: 'service', notice: null };
    case 'SELECT_SERVICE':
      if (state.step !== 'service' && state.step !== 'professional') return state;
      return {
        ...state,
        step: 'professional',
        serviceId: action.serviceId,
        professionalId: null,
        professionalChosen: false,
        date: null,
        time: null,
        confirmation: null,
        notice: null,
      };
    case 'SELECT_PROFESSIONAL':
      if (state.step !== 'professional' && state.step !== 'date') return state;
      return {
        ...state,
        step: 'date',
        professionalId: action.professionalId,
        professionalChosen: true,
        date: null,
        time: null,
        confirmation: null,
        notice: null,
      };
    case 'SELECT_DATE':
      if (state.step !== 'date' && state.step !== 'time') return state;
      return { ...state, step: 'time', date: action.date, time: null, confirmation: null, notice: null };
    case 'SELECT_TIME':
      if (state.step !== 'time') return state;
      return { ...state, time: action.time, notice: null };
    case 'CONFIRMED':
      if (state.step !== 'time') return state;
      return { ...state, step: 'confirmation', confirmation: action.confirmation, notice: null };
    case 'CONFLICT':
      if (state.step !== 'time' && state.step !== 'confirmation') return state;
      return { ...state, step: 'time', time: null, confirmation: null, notice: action.message };
    case 'SESSION_EXPIRED':
      return { ...initialBookingState, notice: SESSION_EXPIRED_MESSAGE };
    case 'RATE_LIMITED':
      return { ...state, notice: RATE_LIMIT_MESSAGE };
    case 'NOTICE':
      return { ...state, notice: action.message };
    case 'BACK': {
      const step = BACK[state.step];
      if (!step) return state;
      return { ...state, step, notice: null };
    }
    default:
      return state;
  }
}

function fail(err: unknown, dispatch: (action: BookingAction) => void): void {
  if (err instanceof PublicApiError && err.status === 429) {
    dispatch({ type: 'RATE_LIMITED' });
    return;
  }
  if (err instanceof PublicApiError && err.status === 401) {
    dispatch({ type: 'SESSION_EXPIRED' });
    return;
  }
  dispatch({
    type: 'NOTICE',
    message: err instanceof PublicApiError ? err.message : 'Não foi possível continuar.',
  });
}

export function usePublicBooking(slug: string) {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState);
  const [pending, setPending] = useState(false);
  const queryClient = useQueryClient();

  const identify = async (phone: string) => {
    setPending(true);
    try {
      const data = await publicBookingService.identify(slug, phone);
      if (data.registered) {
        dispatch({ type: 'IDENTIFIED', registered: true, firstName: data.firstName ?? '' });
      } else {
        dispatch({ type: 'IDENTIFIED', registered: false });
      }
    } catch (err) {
      fail(err, dispatch);
    } finally {
      setPending(false);
    }
  };

  const register = async (input: Omit<RegisterInput, 'lgpdConsent'>) => {
    setPending(true);
    try {
      const data = await publicBookingService.register(slug, { ...input, lgpdConsent: true });
      dispatch({ type: 'REGISTERED', firstName: data.firstName });
    } catch (err) {
      fail(err, dispatch);
    } finally {
      setPending(false);
    }
  };

  const book = async (input: { serviceId: string; professionalId: string | null; start: string }) => {
    setPending(true);
    try {
      const confirmation = await publicBookingService.book(slug, { ...input, website: '' });
      dispatch({ type: 'CONFIRMED', confirmation });
    } catch (err) {
      if (err instanceof PublicApiError && err.status === 409) {
        dispatch({ type: 'CONFLICT', message: err.message });
        await queryClient.invalidateQueries({ queryKey: ['public-booking', slug, 'availability'] });
        return;
      }
      fail(err, dispatch);
    } finally {
      setPending(false);
    }
  };

  return { state, pending, dispatch, identify, register, book };
}
