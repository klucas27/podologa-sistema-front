import React from 'react';
import { formatLongDate } from '../lib/dates';
import type { BookingConfirmation } from '../hooks/usePublicBooking';

interface ConfirmationCardProps {
  booking: BookingConfirmation;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({ booking }) => {
  const [date, time] = booking.start.split('T');
  const endTime = booking.end.split('T')[1] ?? '';

  return (
    <div className="rounded-lg border border-primary-200 bg-white px-4 py-4">
      <h2 className="font-display text-2xl text-primary-700">Horário reservado</h2>
      <dl className="mt-4 space-y-2 text-base text-gray-800">
        <div>
          <dt className="text-sm text-gray-500">Serviço</dt>
          <dd>{booking.serviceName}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Profissional</dt>
          <dd>{booking.professionalFirstName}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Data</dt>
          <dd>{date ? formatLongDate(date) : booking.start}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Horário</dt>
          <dd>{time}{endTime ? ` – ${endTime}` : ''}</dd>
        </div>
        {booking.address ? (
          <div>
            <dt className="text-sm text-gray-500">Endereço</dt>
            <dd>{booking.address}</dd>
          </div>
        ) : null}
      </dl>
      {booking.status === 'pending' ? (
        <p className="mt-4 text-sm font-medium text-primary-700">Aguardando confirmação do salão</p>
      ) : null}
      <p className="mt-3 text-sm text-gray-700">
        Guarde este código para alterar seu horário: {booking.manageToken}
      </p>
    </div>
  );
};
