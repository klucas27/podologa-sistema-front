import React from 'react';
import { MARITAL_OPTIONS, BRAZILIAN_STATES, INPUT_CLASS, type PatientForm } from '../constants';

interface Props {
  form: PatientForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const PatientFormFields: React.FC<Props> = ({ form, onChange }) => (
  <>
    {/* Dados pessoais */}
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-700">Dados Pessoais</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
          <input id="fullName" name="fullName" type="text" required value={form.fullName} onChange={onChange} placeholder="Nome completo do paciente" className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
          <input id="cpf" name="cpf" type="text" required maxLength={14} value={form.cpf} onChange={onChange} placeholder="000.000.000-00" className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
          <input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={onChange} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">Estado civil</label>
          <select id="maritalStatus" name="maritalStatus" value={form.maritalStatus} onChange={onChange} className={INPUT_CLASS}>
            {MARITAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
          <input id="occupation" name="occupation" type="text" value={form.occupation} onChange={onChange} placeholder="Ex: Professora" className={INPUT_CLASS} />
        </div>
      </div>
    </section>

    {/* Contato */}
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-700">Contato</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input id="phoneNumber" name="phoneNumber" type="tel" value={form.phoneNumber} onChange={onChange} placeholder="(00) 00000-0000" className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="paciente@email.com" className={INPUT_CLASS} />
        </div>
      </div>
    </section>

    {/* Endereço */}
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-700">Endereço</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
          <input id="zipCode" name="zipCode" type="text" maxLength={10} value={form.zipCode} onChange={onChange} placeholder="00000-000" className={INPUT_CLASS} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
          <input id="street" name="street" type="text" value={form.street} onChange={onChange} placeholder="Nome da rua" className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="addressNumber" className="block text-sm font-medium text-gray-700 mb-1">Número</label>
          <input id="addressNumber" name="addressNumber" type="text" value={form.addressNumber} onChange={onChange} placeholder="Nº" className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
          <input id="neighborhood" name="neighborhood" type="text" value={form.neighborhood} onChange={onChange} placeholder="Bairro" className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
          <input id="city" name="city" type="text" value={form.city} onChange={onChange} placeholder="Cidade" className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select id="state" name="state" value={form.state} onChange={onChange} className={INPUT_CLASS}>
            <option value="">Selecione</option>
            {BRAZILIAN_STATES.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  </>
);
