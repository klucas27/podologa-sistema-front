import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { MARITAL_OPTIONS, BRAZILIAN_STATES, ACQUISITION_OPTIONS, INPUT_CLASS, type PatientForm } from '../constants';
import { useAuth } from '@/hooks/useAuth';
import { professionalService } from '@/features/professionals/services/professional.service';
import { patientService } from '../services/patient.service';
import { normalizePhone } from '@/lib/phone';
import type { Patient, Professional } from '@/types';

interface Props {
  form: PatientForm;
  mode: 'create' | 'edit';
  currentPatientId?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onProfessionalIdsChange?: (ids: string[]) => void;
}

export const PatientFormFields: React.FC<Props> = ({ form, mode, currentPatientId, onChange, onProfessionalIdsChange }) => {
  const { role } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [duplicate, setDuplicate] = useState<Patient | null>(null);

  useEffect(() => {
    if (role === 'admin') {
      professionalService.listActive().then(setProfessionals).catch(() => setProfessionals([]));
    }
  }, [role]);

  // Telefone é a chave da cliente: avisa na hora se já existe cadastro
  const checkPhone = () => {
    const phone = normalizePhone(form.phoneNumber);
    if (!phone || (role !== 'admin' && role !== 'recepcao')) return setDuplicate(null);
    patientService.findByPhone(phone)
      .then((p) => setDuplicate(p && p.id !== currentPatientId ? p : null))
      .catch(() => setDuplicate(null));
  };

  const handleProfessionalToggle = (profId: string) => {
    const next = form.professionalIds.includes(profId)
      ? form.professionalIds.filter((id) => id !== profId)
      : [...form.professionalIds, profId];
    onProfessionalIdsChange?.(next);
  };

  return (
    <>
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-700">Cadastro rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Celular (WhatsApp) *</label>
            <input id="phoneNumber" name="phoneNumber" type="tel" inputMode="numeric" autoComplete="tel" required
              value={form.phoneNumber} onChange={onChange} onBlur={checkPhone} placeholder="(12) 98803-6103" className={INPUT_CLASS} />
            {duplicate && (
              <div role="alert" className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <span>
                  Já existe a cliente <strong>{duplicate.fullName}</strong> com este celular.{' '}
                  <Link to={`/pacientes/${duplicate.id}`} className="underline font-medium">Abrir ficha</Link>
                </span>
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
            <input id="fullName" name="fullName" type="text" required autoComplete="name" value={form.fullName} onChange={onChange} placeholder="Nome da cliente" className={INPUT_CLASS} />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
            <input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={onChange} className={INPUT_CLASS} />
          </div>
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input id="instagram" name="instagram" type="text" autoCapitalize="none" value={form.instagram} onChange={onChange} placeholder="@cliente" className={INPUT_CLASS} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="acquisitionSource" className="block text-sm font-medium text-gray-700 mb-1">Como conheceu o salão?</label>
            <select id="acquisitionSource" name="acquisitionSource" value={form.acquisitionSource} onChange={onChange} className={INPUT_CLASS}>
              <option value="">Não informado</option>
              {ACQUISITION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {mode === 'create' && (
            <label htmlFor="lgpdConsent" className="flex items-start gap-3 min-h-11 cursor-pointer">
              <input id="lgpdConsent" name="lgpdConsent" type="checkbox" checked={form.lgpdConsent} onChange={onChange}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
              <span className="text-sm text-gray-700">
                A cliente autorizou o uso dos dados para agendamento e histórico de atendimento (LGPD). *
              </span>
            </label>
          )}
          <label htmlFor="imageConsent" className="flex items-start gap-3 min-h-11 cursor-pointer">
            <input id="imageConsent" name="imageConsent" type="checkbox" checked={form.imageConsent} onChange={onChange}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
            <span className="text-sm text-gray-700">Autoriza fotos do trabalho nas redes sociais</span>
          </label>
        </div>
      </section>

      <details className="bg-white rounded-xl border border-gray-200 p-6 group" open={mode === 'edit'}>
        <summary className="text-lg font-semibold text-gray-700 cursor-pointer min-h-11 flex items-center">Mais dados (opcional)</summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input id="cpf" name="cpf" type="text" inputMode="numeric" maxLength={14} value={form.cpf} onChange={onChange} placeholder="000.000.000-00" className={INPUT_CLASS} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="cliente@email.com" className={INPUT_CLASS} />
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
      </details>

      <details className="bg-white rounded-xl border border-gray-200 p-6" open={mode === 'edit'}>
        <summary className="text-lg font-semibold text-gray-700 cursor-pointer min-h-11 flex items-center">Endereço (opcional)</summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
      </details>

      {/* Profissionais vinculados (admin only) */}
      {role === 'admin' && professionals.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-700">Profissionais vinculadas</h2>
          <p className="text-sm text-gray-500">Selecione as profissionais vinculadas a esta cliente.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {professionals.map((prof) => {
              const isSelected = form.professionalIds.includes(prof.id);
              return (
                <label
                  key={prof.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    isSelected
                      ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-300'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleProfessionalToggle(prof.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-400"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{prof.fullName}</p>
                    {prof.specialty && <p className="text-xs text-gray-500 truncate">{prof.specialty}</p>}
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
};
