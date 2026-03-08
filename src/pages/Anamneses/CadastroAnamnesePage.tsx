import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import type { Perfusion, PainSensitivity, Anamnesis } from '@/types';

interface AnamnesisForm {
  frequentlyUsedFootwear: string;
  frequentlyUsedSocks: string;
  practicedSports: string;
  hasLowerLimbSurgery: boolean;
  lowerLimbSurgeryDetails: string;
  medicationsInUse: string;
  isPregnant: boolean;
  hasPacemakerOrPins: boolean;
  hasHypertension: boolean;
  hasSeizures: boolean;
  hasCancerHistory: boolean;
  hasDiabetes: boolean;
  hasCirculatoryProblems: boolean;
  hasHealingProblems: boolean;
  perfusion: Perfusion;
  hasMonofilamentSensitivity: boolean;
  dermatologicalPathologies: string;
  nailPathologies: string;
  otherObservations: string;
  painSensitivity: PainSensitivity;
}

const INITIAL_FORM: AnamnesisForm = {
  frequentlyUsedFootwear: '',
  frequentlyUsedSocks: '',
  practicedSports: '',
  hasLowerLimbSurgery: false,
  lowerLimbSurgeryDetails: '',
  medicationsInUse: '',
  isPregnant: false,
  hasPacemakerOrPins: false,
  hasHypertension: false,
  hasSeizures: false,
  hasCancerHistory: false,
  hasDiabetes: false,
  hasCirculatoryProblems: false,
  hasHealingProblems: false,
  perfusion: 'normal',
  hasMonofilamentSensitivity: true,
  dermatologicalPathologies: '',
  nailPathologies: '',
  otherObservations: '',
  painSensitivity: 'none',
};

const PERFUSION_OPTIONS: { value: Perfusion; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'pale', label: 'Pálida' },
  { value: 'cyanotic', label: 'Cianótica' },
  { value: 'edematous', label: 'Edematosa' },
];

const PAIN_SENSITIVITY_OPTIONS: { value: PainSensitivity; label: string }[] = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'low', label: 'Baixa' },
  { value: 'moderate', label: 'Moderada' },
  { value: 'high', label: 'Alta' },
];

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition';

const CadastroAnamnesePage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [form, setForm] = useState<AnamnesisForm>(INITIAL_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingId, setExistingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const isEditMode = existingId !== null;

  const fetchExistingAnamnesis = useCallback(async () => {
    if (!patientId) { setIsLoading(false); return; }
    try {
      const res = await api.get<{ data: Anamnesis[] }>(`/api/anamneses/patient/${patientId}`);
      const list = res.data;
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
        await api.patch(`/api/anamneses/${existingId}`, payload);
      } else {
        await api.post('/api/anamneses', payload);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate(`/pacientes/${patientId}`)}
        >
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Editar Anamnese' : 'Nova Anamnese'}
        </h1>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hábitos e Estilo de Vida */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-700">Hábitos e Estilo de Vida</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="frequentlyUsedFootwear" className="block text-sm font-medium text-gray-700 mb-1">
                Calçados mais utilizados
              </label>
              <input
                id="frequentlyUsedFootwear"
                name="frequentlyUsedFootwear"
                type="text"
                value={form.frequentlyUsedFootwear}
                onChange={handleChange}
                placeholder="Ex: Tênis, sandália"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="frequentlyUsedSocks" className="block text-sm font-medium text-gray-700 mb-1">
                Meias mais utilizadas
              </label>
              <input
                id="frequentlyUsedSocks"
                name="frequentlyUsedSocks"
                type="text"
                value={form.frequentlyUsedSocks}
                onChange={handleChange}
                placeholder="Ex: Algodão, sintética"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="practicedSports" className="block text-sm font-medium text-gray-700 mb-1">
                Esportes praticados
              </label>
              <input
                id="practicedSports"
                name="practicedSports"
                type="text"
                value={form.practicedSports}
                onChange={handleChange}
                placeholder="Ex: Caminhada, corrida"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Histórico Médico */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-700">Histórico Médico</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'hasHypertension', label: 'Hipertensão' },
              { name: 'hasDiabetes', label: 'Diabetes' },
              { name: 'hasCirculatoryProblems', label: 'Problemas circulatórios' },
              { name: 'hasHealingProblems', label: 'Problemas de cicatrização' },
              { name: 'hasSeizures', label: 'Convulsões' },
              { name: 'hasCancerHistory', label: 'Histórico de câncer' },
              { name: 'hasPacemakerOrPins', label: 'Marcapasso ou pinos' },
              { name: 'isPregnant', label: 'Gestante' },
              { name: 'hasLowerLimbSurgery', label: 'Cirurgia em membros inferiores' },
            ].map(({ name, label }) => (
              <label
                key={name}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  name={name}
                  checked={form[name as keyof AnamnesisForm] as boolean}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {form.hasLowerLimbSurgery && (
            <div>
              <label htmlFor="lowerLimbSurgeryDetails" className="block text-sm font-medium text-gray-700 mb-1">
                Detalhes da cirurgia
              </label>
              <textarea
                id="lowerLimbSurgeryDetails"
                name="lowerLimbSurgeryDetails"
                rows={3}
                value={form.lowerLimbSurgeryDetails}
                onChange={handleChange}
                placeholder="Descreva os detalhes da cirurgia..."
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label htmlFor="medicationsInUse" className="block text-sm font-medium text-gray-700 mb-1">
              Medicamentos em uso
            </label>
            <textarea
              id="medicationsInUse"
              name="medicationsInUse"
              rows={3}
              value={form.medicationsInUse}
              onChange={handleChange}
              placeholder="Liste os medicamentos em uso..."
              className={inputClass}
            />
          </div>
        </section>

        {/* Avaliação Podológica */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-700">Avaliação Podológica</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="perfusion" className="block text-sm font-medium text-gray-700 mb-1">
                Perfusão
              </label>
              <select
                id="perfusion"
                name="perfusion"
                value={form.perfusion}
                onChange={handleChange}
                className={inputClass}
              >
                {PERFUSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="painSensitivity" className="block text-sm font-medium text-gray-700 mb-1">
                Sensibilidade à dor
              </label>
              <select
                id="painSensitivity"
                name="painSensitivity"
                value={form.painSensitivity}
                onChange={handleChange}
                className={inputClass}
              >
                {PAIN_SENSITIVITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition w-fit">
            <input
              type="checkbox"
              name="hasMonofilamentSensitivity"
              checked={form.hasMonofilamentSensitivity}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
            />
            <span className="text-sm text-gray-700">Sensibilidade ao monofilamento</span>
          </label>

          <div>
            <label htmlFor="dermatologicalPathologies" className="block text-sm font-medium text-gray-700 mb-1">
              Patologias dermatológicas
            </label>
            <textarea
              id="dermatologicalPathologies"
              name="dermatologicalPathologies"
              rows={3}
              value={form.dermatologicalPathologies}
              onChange={handleChange}
              placeholder="Descreva as patologias dermatológicas encontradas..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="nailPathologies" className="block text-sm font-medium text-gray-700 mb-1">
              Patologias ungueais
            </label>
            <textarea
              id="nailPathologies"
              name="nailPathologies"
              rows={3}
              value={form.nailPathologies}
              onChange={handleChange}
              placeholder="Descreva as patologias ungueais encontradas..."
              className={inputClass}
            />
          </div>
        </section>

        {/* Observações */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-700">Observações</h2>
          <div>
            <label htmlFor="otherObservations" className="block text-sm font-medium text-gray-700 mb-1">
              Outras observações
            </label>
            <textarea
              id="otherObservations"
              name="otherObservations"
              rows={4}
              value={form.otherObservations}
              onChange={handleChange}
              placeholder="Observações adicionais..."
              className={inputClass}
            />
          </div>
        </section>

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/pacientes/${patientId}`)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            icon={<Save size={16} />}
          >
            {isEditMode ? 'Salvar alterações' : 'Salvar anamnese'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CadastroAnamnesePage;
