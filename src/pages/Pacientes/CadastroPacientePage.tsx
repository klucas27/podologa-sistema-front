import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ClipboardPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import type { MaritalStatus, Patient } from '@/types';

interface PatientForm {
  fullName: string;
  dateOfBirth: string;
  maritalStatus: MaritalStatus;
  occupation: string;
  cpf: string;
  phoneNumber: string;
  email: string;
  zipCode: string;
  street: string;
  addressNumber: string;
  neighborhood: string;
  city: string;
  state: string;
}

const INITIAL_FORM: PatientForm = {
  fullName: '',
  dateOfBirth: '',
  maritalStatus: 'other',
  occupation: '',
  cpf: '',
  phoneNumber: '',
  email: '',
  zipCode: '',
  street: '',
  addressNumber: '',
  neighborhood: '',
  city: '',
  state: '',
};

const MARITAL_OPTIONS: { value: MaritalStatus; label: string }[] = [
  { value: 'single', label: 'Solteiro(a)' },
  { value: 'married', label: 'Casado(a)' },
  { value: 'divorced', label: 'Divorciado(a)' },
  { value: 'widowed', label: 'Viúvo(a)' },
  { value: 'other', label: 'Outro' },
];

const BRAZILIAN_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition';

const CadastroPacientePage: React.FC = () => {
  const [form, setForm] = useState<PatientForm>(INITIAL_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectToAnamnesis, setRedirectToAnamnesis] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim() || !form.cpf.trim()) {
      setError('Nome completo e CPF são obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<{ status: string; data: Patient }>('/api/patients', {
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth || null,
        maritalStatus: form.maritalStatus,
        occupation: form.occupation || null,
        cpf: form.cpf.replace(/\D/g, ''),
        phoneNumber: form.phoneNumber || null,
        email: form.email || null,
        zipCode: form.zipCode || null,
        street: form.street || null,
        addressNumber: form.addressNumber || null,
        neighborhood: form.neighborhood || null,
        city: form.city || null,
        state: form.state || null,
      });

      const createdId = response.data.id;

      if (redirectToAnamnesis) {
        navigate(`/pacientes/${createdId}/anamnese/nova`);
      } else {
        navigate('/pacientes');
      }
    } catch (err) {
      const message =
        (err as any)?.message || 'Erro ao cadastrar paciente. Tente novamente.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate('/pacientes')}
        >
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Novo Paciente</h1>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dados pessoais */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-700">Dados Pessoais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nome completo do paciente"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                required
                maxLength={14}
                value={form.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Data de nascimento
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Estado civil
              </label>
              <select
                id="maritalStatus"
                name="maritalStatus"
                value={form.maritalStatus}
                onChange={handleChange}
                className={inputClass}
              >
                {MARITAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                Profissão
              </label>
              <input
                id="occupation"
                name="occupation"
                type="text"
                value={form.occupation}
                onChange={handleChange}
                placeholder="Ex: Professora"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Contato */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-700">Contato</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="paciente@email.com"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-700">Endereço</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                maxLength={10}
                value={form.zipCode}
                onChange={handleChange}
                placeholder="00000-000"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                Rua
              </label>
              <input
                id="street"
                name="street"
                type="text"
                value={form.street}
                onChange={handleChange}
                placeholder="Nome da rua"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="addressNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Número
              </label>
              <input
                id="addressNumber"
                name="addressNumber"
                type="text"
                value={form.addressNumber}
                onChange={handleChange}
                placeholder="Nº"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                Bairro
              </label>
              <input
                id="neighborhood"
                name="neighborhood"
                type="text"
                value={form.neighborhood}
                onChange={handleChange}
                placeholder="Bairro"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="Cidade"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="state"
                name="state"
                value={form.state}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Selecione</option>
                {BRAZILIAN_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/pacientes')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="secondary"
            isLoading={isSubmitting && redirectToAnamnesis}
            icon={<ClipboardPlus size={16} />}
            onClick={() => setRedirectToAnamnesis(true)}
          >
            Salvar e cadastrar anamnese
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting && !redirectToAnamnesis}
            icon={<Save size={16} />}
            onClick={() => setRedirectToAnamnesis(false)}
          >
            Salvar paciente
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CadastroPacientePage;
