import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/patient.service';
import { INITIAL_PATIENT_FORM, patientPayload, type PatientForm } from '../constants';
import { maskPhone, normalizePhone } from '@/lib/phone';

export function useCadastroPacientePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PatientForm>(INITIAL_PATIENT_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectToAnamnesis, setRedirectToAnamnesis] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const next = e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
      ? e.target.checked
      : name === 'phoneNumber' ? maskPhone(value) : value;
    setForm((prev) => ({ ...prev, [name]: next }));
  };

  const handleProfessionalIdsChange = (ids: string[]) => {
    setForm((prev) => ({ ...prev, professionalIds: ids }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) return setError('Informe o nome da cliente.');
    if (!normalizePhone(form.phoneNumber)) return setError('Informe um celular válido com DDD.');
    if (!form.lgpdConsent) return setError('Confirme o consentimento LGPD da cliente.');

    setIsSubmitting(true);
    try {
      const created = await patientService.create({
        ...patientPayload(form),
        lgpdConsent: true,
        professionalIds: form.professionalIds.length > 0 ? form.professionalIds : undefined,
      } as Record<string, unknown>);

      if (redirectToAnamnesis) {
        navigate(`/pacientes/${created.id}/anamnese/nova`);
      } else {
        navigate('/pacientes');
      }
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Erro ao cadastrar cliente. Tente novamente.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form, error, isSubmitting, redirectToAnamnesis,
    handleChange, handleProfessionalIdsChange, handleSubmit,
    setRedirectToAnamnesis,
    goBack: () => navigate('/pacientes'),
  };
}
