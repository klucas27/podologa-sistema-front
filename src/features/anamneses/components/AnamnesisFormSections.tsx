import React from 'react';
import {
  MEDICAL_HISTORY_FIELDS,
  PERFUSION_OPTIONS,
  PAIN_SENSITIVITY_OPTIONS,
  INPUT_CLASS,
  type AnamnesisForm,
} from '../constants';

interface Props {
  form: AnamnesisForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const MedicalHistorySection: React.FC<Props> = ({ form, onChange }) => (
  <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
    <h2 className="text-lg font-semibold text-gray-700">Histórico Médico</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {MEDICAL_HISTORY_FIELDS.map(({ name, label }) => (
        <label
          key={name}
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
        >
          <input
            type="checkbox"
            name={name}
            checked={form[name as keyof AnamnesisForm] as boolean}
            onChange={onChange}
            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
          />
          <span className="text-sm text-gray-700">{label}</span>
        </label>
      ))}
    </div>
    {form.hasLowerLimbSurgery && (
      <div>
        <label htmlFor="lowerLimbSurgeryDetails" className="block text-sm font-medium text-gray-700 mb-1">
          Detalhes da cirurgia
        </label>
        <textarea
          id="lowerLimbSurgeryDetails"
          name="lowerLimbSurgeryDetails"
          rows={3}
          value={form.lowerLimbSurgeryDetails}
          onChange={onChange}
          placeholder="Descreva os detalhes da cirurgia..."
          className={INPUT_CLASS}
        />
      </div>
    )}
    <div>
      <label htmlFor="medicationsInUse" className="block text-sm font-medium text-gray-700 mb-1">
        Medicamentos em uso
      </label>
      <textarea
        id="medicationsInUse"
        name="medicationsInUse"
        rows={3}
        value={form.medicationsInUse}
        onChange={onChange}
        placeholder="Liste os medicamentos em uso..."
        className={INPUT_CLASS}
      />
    </div>
  </section>
);

export const PodologicalSection: React.FC<Props> = ({ form, onChange }) => (
  <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
    <h2 className="text-lg font-semibold text-gray-700">Avaliação Podológica</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="perfusion" className="block text-sm font-medium text-gray-700 mb-1">Perfusão</label>
        <select id="perfusion" name="perfusion" value={form.perfusion} onChange={onChange} className={INPUT_CLASS}>
          {PERFUSION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="painSensitivity" className="block text-sm font-medium text-gray-700 mb-1">Sensibilidade à dor</label>
        <select id="painSensitivity" name="painSensitivity" value={form.painSensitivity} onChange={onChange} className={INPUT_CLASS}>
          {PAIN_SENSITIVITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition w-fit">
      <input
        type="checkbox"
        name="hasMonofilamentSensitivity"
        checked={form.hasMonofilamentSensitivity}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
      />
      <span className="text-sm text-gray-700">Sensibilidade ao monofilamento</span>
    </label>
    <div>
      <label htmlFor="dermatologicalPathologies" className="block text-sm font-medium text-gray-700 mb-1">Patologias dermatológicas</label>
      <textarea id="dermatologicalPathologies" name="dermatologicalPathologies" rows={3} value={form.dermatologicalPathologies} onChange={onChange} placeholder="Descreva as patologias dermatológicas encontradas..." className={INPUT_CLASS} />
    </div>
    <div>
      <label htmlFor="nailPathologies" className="block text-sm font-medium text-gray-700 mb-1">Patologias ungueais</label>
      <textarea id="nailPathologies" name="nailPathologies" rows={3} value={form.nailPathologies} onChange={onChange} placeholder="Descreva as patologias ungueais encontradas..." className={INPUT_CLASS} />
    </div>
  </section>
);
