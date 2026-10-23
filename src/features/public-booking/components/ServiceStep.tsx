import React from 'react';
import type { PublicService } from '../services/publicBooking.service';

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface ServiceStepProps {
  services: PublicService[];
  onSelect: (serviceId: string) => void;
}

export const ServiceStep: React.FC<ServiceStepProps> = ({ services, onSelect }) => (
  <div>
    <h2 className="font-display text-2xl text-primary-700">Serviço</h2>
    {services.length === 0 ? (
      <p className="mt-3 text-sm text-gray-600">Nenhum serviço disponível neste link.</p>
    ) : (
      <ul className="mt-4 space-y-2">
        {services.map((service) => (
          <li key={service.id}>
            <button
              type="button"
              onClick={() => onSelect(service.id)}
              className="min-h-11 w-full rounded-lg border border-primary-200 bg-white px-3 py-3 text-left"
            >
              <span className="block text-base font-medium text-gray-800">{service.name}</span>
              <span className="mt-1 block text-sm text-gray-600">
                {service.durationMinutes} min · {brl(service.price)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);
