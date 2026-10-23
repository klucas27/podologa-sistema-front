import React from 'react';
import type { PublicProfessional } from '../services/publicBooking.service';

interface ProfessionalStepProps {
  professionals: PublicProfessional[];
  onSelect: (professionalId: string | null) => void;
}

export const ProfessionalStep: React.FC<ProfessionalStepProps> = ({ professionals, onSelect }) => (
  <div>
    <h2 className="font-display text-2xl text-primary-700">Profissional</h2>
    <ul className="mt-4 space-y-2">
      <li>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="min-h-11 w-full rounded-lg border border-primary-200 bg-white px-3 py-3 text-left text-base font-medium"
        >
          Sem preferência
        </button>
      </li>
      {professionals.map((professional) => (
        <li key={professional.id}>
          <button
            type="button"
            onClick={() => onSelect(professional.id)}
            className="min-h-11 w-full rounded-lg border border-primary-200 bg-white px-3 py-3 text-left text-base"
          >
            {professional.firstName}
          </button>
        </li>
      ))}
    </ul>
  </div>
);
