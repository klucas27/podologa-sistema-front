import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatient, useUpdatePatient } from './usePatients';
import { toDateInTz } from '@/lib/dateUtils';
import { patientPayload, type PatientForm } from '../constants';
import { maskPhone, normalizePhone } from '@/lib/phone';

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
      cpf: patient.cpf ?? '',
      phoneNumber: maskPhone(patient.phoneNormalized ?? patient.phoneNumber ?? ''),
      email: patient.email ?? '',
      zipCode: patient.zipCode ?? '',
      street: patient.street ?? '',
      addressNumber: patient.addressNumber ?? '',
      neighborhood: patient.neighborhood ?? '',
      city: patient.city ?? '',
      state: patient.state ?? '',
      instagram: patient.instagram ?? '',
      acquisitionSource: patient.acquisitionSource ?? '',
      lgpdConsent: !!patient.lgpdConsentAt,
      imageConsent: !!patient.imageConsentAt,
      professionalIds,
    });
  }, [patient, form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const next = e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
      ? e.target.checked
      : name === 'phoneNumber' ? maskPhone(value) : value;
    setForm((prev) => (prev ? { ...prev, [name]: next } : prev));
  };

  const handleProfessionalIdsChange = (ids: string[]) => {
    setForm((prev) => (prev ? { ...prev, professionalIds: ids } : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !id) return;
    setError('');

    if (!form.fullName.trim()) return setError('Informe o nome da cliente.');
    if (!normalizePhone(form.phoneNumber)) return setError('Informe um celular válido com DDD.');

    updateMutation.mutate(
      {
        id,
        data: {
          ...patientPayload(form),
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
