import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAnamnesesByPatient, useCreateAnamnesis, useUpdateAnamnesis } from './useAnamneses';
import { INITIAL_FORM, type AnamnesisForm } from '../constants';

export function useCadastroAnamnesePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<AnamnesisForm>(INITIAL_FORM);
  const [error, setError] = useState('');
  const [existingId, setExistingId] = useState<string | null>(null);

  const isEditMode = existingId !== null;

  // React Query: fetch existing anamnesis for this patient
  const { data: anamnesesList = [], isLoading } = useAnamnesesByPatient(patientId ?? '');
  const createMutation = useCreateAnamnesis();
  const updateMutation = useUpdateAnamnesis();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Populate form from existing anamnesis — legitimate derived state effect
  useEffect(() => {
    if (anamnesesList.length > 0 && !existingId) {
      const a = anamnesesList[0]!;
      setExistingId(a.id);
      setForm({
        frequentlyUsedFootwear: a.frequentlyUsedFootwear ?? '',
        frequentlyUsedSocks: a.frequentlyUsedSocks ?? '',
        practicedSports: a.practicedSports ?? '',
        hasLowerLimbSurgery: a.hasLowerLimbSurgery,
        lowerLimbSurgeryDetails: a.lowerLimbSurgeryDetails ?? '',
        medicationsInUse: a.medicationsInUse ?? '',
        isPregnant: a.isPregnant,
        hasPacemakerOrPins: a.hasPacemakerOrPins,
        hasHypertension: a.hasHypertension,
        hasSeizures: a.hasSeizures,
        hasCancerHistory: a.hasCancerHistory,
        hasDiabetes: a.hasDiabetes,
        hasCirculatoryProblems: a.hasCirculatoryProblems,
        hasHealingProblems: a.hasHealingProblems,
        perfusion: a.perfusion,
        hasMonofilamentSensitivity: a.hasMonofilamentSensitivity,
        dermatologicalPathologies: a.dermatologicalPathologies ?? '',
        nailPathologies: a.nailPathologies ?? '',
        otherObservations: a.otherObservations ?? '',
        painSensitivity: a.painSensitivity ?? 'none',
      });
    }
  }, [anamnesesList, existingId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientId) {
      setError('Paciente não identificado');
      return;
    }

    const payload = {
      patientId,
      frequentlyUsedFootwear: form.frequentlyUsedFootwear || null,
      frequentlyUsedSocks: form.frequentlyUsedSocks || null,
      practicedSports: form.practicedSports || null,
      hasLowerLimbSurgery: form.hasLowerLimbSurgery,
      lowerLimbSurgeryDetails: form.lowerLimbSurgeryDetails || null,
      medicationsInUse: form.medicationsInUse || null,
      isPregnant: form.isPregnant,
      hasPacemakerOrPins: form.hasPacemakerOrPins,
      hasHypertension: form.hasHypertension,
      hasSeizures: form.hasSeizures,
      hasCancerHistory: form.hasCancerHistory,
      hasDiabetes: form.hasDiabetes,
      hasCirculatoryProblems: form.hasCirculatoryProblems,
      hasHealingProblems: form.hasHealingProblems,
      perfusion: form.perfusion,
      hasMonofilamentSensitivity: form.hasMonofilamentSensitivity,
      dermatologicalPathologies: form.dermatologicalPathologies || null,
      nailPathologies: form.nailPathologies || null,
      otherObservations: form.otherObservations || null,
      painSensitivity: form.painSensitivity,
    };

    const onSuccess = () => navigate(`/pacientes/${patientId}`);
    const onError = (err: unknown) => {
      const message =
        (err as { message?: string })?.message || 'Erro ao salvar anamnese. Tente novamente.';
      setError(message);
    };

    if (isEditMode) {
      updateMutation.mutate({ id: existingId!, data: payload, patientId }, { onSuccess, onError });
    } else {
      createMutation.mutate(payload, { onSuccess, onError });
    }
  };

  return {
    patientId,
    form,
    error,
    isSubmitting,
    isLoading,
    isEditMode,
    handleChange,
    handleSubmit,
    navigateBack: () => navigate(`/pacientes/${patientId}`),
  };
}
