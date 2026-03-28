import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { anamnesisService } from '../services/anamnesis.service';
import { INITIAL_FORM, type AnamnesisForm } from '../constants';

export function useCadastroAnamnesePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<AnamnesisForm>(INITIAL_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingId, setExistingId] = useState<string | null>(null);

  const isEditMode = existingId !== null;

  const fetchExistingAnamnesis = useCallback(async () => {
    if (!patientId) {
      setIsLoading(false);
      return;
    }
    try {
      const list = await anamnesisService.getByPatientId(patientId);
      if (list.length > 0) {
        const a = list[0];
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
    } catch {
      /* patient has no anamnesis — create mode */
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchExistingAnamnesis();
  }, [fetchExistingAnamnesis]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientId) {
      setError('Paciente não identificado');
      return;
    }

    setIsSubmitting(true);

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

    try {
      if (isEditMode) {
        await anamnesisService.update(existingId!, payload);
      } else {
        await anamnesisService.create(payload);
      }
      navigate(`/pacientes/${patientId}`);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || 'Erro ao salvar anamnese. Tente novamente.';
      setError(message);
    } finally {
      setIsSubmitting(false);
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
