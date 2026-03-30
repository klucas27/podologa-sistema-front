import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatient, useUpdatePatient } from './usePatients';
import { toDateInTz } from '@/lib/dateUtils';
import type { PatientForm } from '../constants';

export function useEditarPacientePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<PatientForm | null>(null);
  const [error, setError] = useState('');

  const { data: patient, isLoading } = usePatient(id ?? '');
  const updateMutation = useUpdatePatient();
  const isSubmitting = updateMutation.isPending;

  // Populate form from fetched patient data — legitimate derived state effect
  useEffect(() => {
    if (!patient || form) return;
    const raw = patient as unknown as Record<string, unknown>;
    const professionalIds = Array.isArray(raw.patientProfessionals)
      ? (raw.patientProfessionals as { professionalId: string }[]).map((pp) => pp.professionalId)
      : [];
    setForm({
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth ? toDateInTz(patient.dateOfBirth) : '',
      maritalStatus: patient.maritalStatus,
      occupation: patient.occupation ?? '',
      cpf: patient.cpf,
      phoneNumber: patient.phoneNumber ?? '',
      email: patient.email ?? '',
      zipCode: patient.zipCode ?? '',
      street: patient.street ?? '',
      addressNumber: patient.addressNumber ?? '',
      neighborhood: patient.neighborhood ?? '',
      city: patient.city ?? '',
      state: patient.state ?? '',
      professionalIds,
    });
  }, [patient, form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleProfessionalIdsChange = (ids: string[]) => {
    setForm((prev) => (prev ? { ...prev, professionalIds: ids } : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !id) return;
    setError('');

    if (!form.fullName.trim() || !form.cpf.trim()) {
      setError('Nome completo e CPF são obrigatórios');
      return;
    }

    // Send date-only string directly; backend normalizes to noon UTC
    const dateOfBirth: string | null = form.dateOfBirth || null;

    updateMutation.mutate(
      {
        id,
        data: {
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
          ...(form.professionalIds.length > 0 ? { professionalIds: form.professionalIds } : {}),
        } as Parameters<typeof updateMutation.mutate>[0]['data'],
      },
      {
        onSuccess: () => navigate(`/pacientes/${id}`),
        onError: (err) => {
          const message = (err as { message?: string })?.message || 'Erro ao atualizar paciente. Tente novamente.';
          setError(message);
        },
      },
    );
  };

  return {
    id, form, error, isLoading, isSubmitting,
    handleChange, handleProfessionalIdsChange, handleSubmit,
    goBack: () => navigate(`/pacientes/${id}`),
  };
}
