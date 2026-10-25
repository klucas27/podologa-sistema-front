import React from 'react';
import { formatLongDate } from '../lib/dates';
import type { BookingConfirmation } from '../hooks/usePublicBooking';
import { manageUrl } from '../services/publicBooking.service';
import { ShareManageLink } from './ShareManageLink';

interface ConfirmationCardProps {
  slug: string;
  booking: BookingConfirmation;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({ slug, booking }) => {
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
      <div className="mt-4 border-t border-primary-100 pt-4">
        <p className="mb-2 text-sm text-gray-700">Guarde este link para cancelar ou remarcar seu horário:</p>
        <ShareManageLink url={manageUrl(slug, booking.manageToken)} />
      </div>
    </div>
  );
};
