import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/patient.service';
import { INITIAL_PATIENT_FORM, type PatientForm } from '../constants';

export function useCadastroPacientePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PatientForm>(INITIAL_PATIENT_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectToAnamnesis, setRedirectToAnamnesis] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfessionalIdsChange = (ids: string[]) => {
    setForm((prev) => ({ ...prev, professionalIds: ids }));
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
      // Convert date from YYYY-MM-DD (HTML input) to ISO 8601 UTC
      let dateOfBirth: string | null = null;
      if (form.dateOfBirth) {
        const parsed = new Date(form.dateOfBirth + 'T00:00:00');
        if (!isNaN(parsed.getTime())) {
          dateOfBirth = parsed.toISOString();
        }
      }

      const created = await patientService.create({
        fullName: form.fullName,
        dateOfBirth,
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
        professionalIds: form.professionalIds.length > 0 ? form.professionalIds : undefined,
      } as Record<string, unknown>);

      if (redirectToAnamnesis) {
        navigate(`/pacientes/${created.id}/anamnese/nova`);
      } else {
        navigate('/pacientes');
      }
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Erro ao cadastrar paciente. Tente novamente.';
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
