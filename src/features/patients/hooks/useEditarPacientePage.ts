import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { patientService } from '../services/patient.service';
import type { PatientForm } from '../constants';

export function useEditarPacientePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<PatientForm | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPatient = useCallback(async () => {
    if (!id) return;
    try {
      const p = await patientService.getById(id);
      setForm({
        fullName: p.fullName,
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        maritalStatus: p.maritalStatus,
        occupation: p.occupation ?? '',
        cpf: p.cpf,
        phoneNumber: p.phoneNumber ?? '',
        email: p.email ?? '',
        zipCode: p.zipCode ?? '',
        street: p.street ?? '',
        addressNumber: p.addressNumber ?? '',
        neighborhood: p.neighborhood ?? '',
        city: p.city ?? '',
        state: p.state ?? '',
      });
    } catch {
      navigate('/pacientes');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !id) return;
    setError('');

    if (!form.fullName.trim() || !form.cpf.trim()) {
      setError('Nome completo e CPF são obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      await patientService.update(id, {
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
      } as Record<string, unknown>);
      navigate(`/pacientes/${id}`);
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Erro ao atualizar paciente. Tente novamente.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    id, form, error, isLoading, isSubmitting,
    handleChange, handleSubmit,
    goBack: () => navigate(`/pacientes/${id}`),
  };
}
