import React from 'react';

interface PendingRequestCardProps {
  patientName: string;
  phone: string;
  serviceName: string;
  professionalName: string;
  when: string;
  sourceLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}

export const PendingRequestCard: React.FC<PendingRequestCardProps> = ({
  patientName,
  phone,
  serviceName,
  professionalName,
  when,
  sourceLabel,
  busy,
  onConfirm,
  onDecline,
}) => {
  const refuse = () => {
    if (window.confirm('Recusar este pedido?')) onDecline();
  };

  return (
    <article className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div>
        <h2 className="text-base font-semibold text-gray-800">{patientName}</h2>
        <p className="text-sm text-gray-600">{phone}</p>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-gray-500">Serviço</dt>
          <dd className="text-gray-800">{serviceName}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Profissional</dt>
          <dd className="text-gray-800">{professionalName}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Quando</dt>
          <dd className="text-gray-800">{when}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Origem</dt>
          <dd className="text-gray-800">{sourceLabel}</dd>
        </div>
      </dl>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className="min-h-11 rounded-lg bg-primary-500 px-4 text-base text-white disabled:opacity-60"
        >
          Confirmar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={refuse}
          className="min-h-11 rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-800 disabled:opacity-60"
        >
          Recusar
        </button>
      </div>
    </article>
  );
};
