import React, { useState } from 'react';

export interface QuickRegisterValues {
  fullName: string;
  dateOfBirth?: string;
  imageConsent: boolean;
  website: string;
}

interface QuickRegisterStepProps {
  formId?: string;
  consentText: string;
  disabled?: boolean;
  onSubmit: (values: QuickRegisterValues) => void;
}

export const QuickRegisterStep: React.FC<QuickRegisterStepProps> = ({
  formId = 'public-register-form',
  consentText,
  disabled,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [imageConsent, setImageConsent] = useState(false);
  const [website, setWebsite] = useState('');

  return (
    <form
      id={formId}
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!lgpdConsent || fullName.trim().length < 2) return;
        onSubmit({
          fullName: fullName.trim(),
          dateOfBirth: dateOfBirth || undefined,
          imageConsent,
          website,
        });
      }}
    >
      <div>
        <h2 className="font-display text-2xl text-primary-700">Primeiro cadastro</h2>
        <p className="mt-1 text-sm text-gray-600">Só o necessário para guardar seu horário.</p>
      </div>

      <div>
        <label htmlFor="public-name" className="block text-sm font-medium text-gray-700">
          Nome completo
        </label>
        <input
          id="public-name"
          name="fullName"
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          disabled={disabled}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="mt-2 w-full rounded-lg border border-primary-200 bg-white px-3 py-3 text-base outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
        />
      </div>

      <div>
        <label htmlFor="public-birth" className="block text-sm font-medium text-gray-700">
          Nascimento <span className="font-normal text-gray-500">(opcional)</span>
        </label>
        <input
          id="public-birth"
          name="dateOfBirth"
          type="date"
          autoComplete="bday"
          disabled={disabled}
          value={dateOfBirth}
          onChange={(event) => setDateOfBirth(event.target.value)}
          className="mt-2 w-full rounded-lg border border-primary-200 bg-white px-3 py-3 text-base outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 accent-primary-500"
          checked={lgpdConsent}
          required
          disabled={disabled}
          onChange={(event) => setLgpdConsent(event.target.checked)}
        />
        <span>{consentText}</span>
      </label>

      <label className="flex items-start gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 accent-primary-500"
          checked={imageConsent}
          disabled={disabled}
          onChange={(event) => setImageConsent(event.target.checked)}
        />
        <span>Autorizo o uso da minha imagem nos registros do atendimento.</span>
      </label>

      <input
        name="website"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="hidden"
      />
    </form>
  );
};
