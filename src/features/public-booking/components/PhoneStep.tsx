import React, { useState } from 'react';
import { maskPhone, normalizePhone } from '@/lib/phone';

interface PhoneStepProps {
  formId?: string;
  disabled?: boolean;
  onSubmit: (phone: string) => void;
}

export const PhoneStep: React.FC<PhoneStepProps> = ({ formId = 'public-phone-form', disabled, onSubmit }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        const phone = normalizePhone(value);
        if (!phone) {
          setError('Informe o celular com DDD.');
          return;
        }
        setError(null);
        onSubmit(phone);
      }}
    >
      <label htmlFor="public-phone" className="block text-sm font-medium text-gray-700">
        Celular
      </label>
      <input
        id="public-phone"
        name="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        enterKeyHint="next"
        disabled={disabled}
        value={value}
        onChange={(event) => {
          setValue(maskPhone(event.target.value));
          setError(null);
        }}
        placeholder="(12) 98803-6103"
        className="mt-2 w-full rounded-lg border border-primary-200 bg-white px-3 py-3 text-base text-gray-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
      />
      <p className="mt-2 text-sm text-gray-500">Usamos o número só para achar seu cadastro neste salão.</p>
      {error ? <p className="mt-2 text-sm text-danger-700">{error}</p> : null}
    </form>
  );
};
