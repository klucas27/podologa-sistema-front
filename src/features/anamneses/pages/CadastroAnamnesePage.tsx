import React from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useCadastroAnamnesePage } from '../hooks/useCadastroAnamnesePage';
import { MedicalHistorySection, PodologicalSection } from '../components/AnamnesisFormSections';
import { INPUT_CLASS } from '../constants';

const CadastroAnamnesePage: React.FC = () => {
  const {
    form, error, isSubmitting, isLoading, isEditMode,
    handleChange, handleSubmit, navigateBack,
  } = useCadastroAnamnesePage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <ErrorBoundary featureName="Anamnese">
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={18} />} onClick={navigateBack}>Voltar</Button>
        <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Editar Anamnese' : 'Nova Anamnese'}</h1>
      </div>

      {error && <div className="p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hábitos e Estilo de Vida */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-700">Hábitos e Estilo de Vida</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="frequentlyUsedFootwear" className="block text-sm font-medium text-gray-700 mb-1">Calçados mais utilizados</label>
              <input id="frequentlyUsedFootwear" name="frequentlyUsedFootwear" type="text" value={form.frequentlyUsedFootwear} onChange={handleChange} placeholder="Ex: Tênis, sandália" className={INPUT_CLASS} />
            </div>
            <div>
              <label htmlFor="frequentlyUsedSocks" className="block text-sm font-medium text-gray-700 mb-1">Meias mais utilizadas</label>
              <input id="frequentlyUsedSocks" name="frequentlyUsedSocks" type="text" value={form.frequentlyUsedSocks} onChange={handleChange} placeholder="Ex: Algodão, sintética" className={INPUT_CLASS} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="practicedSports" className="block text-sm font-medium text-gray-700 mb-1">Esportes praticados</label>
              <input id="practicedSports" name="practicedSports" type="text" value={form.practicedSports} onChange={handleChange} placeholder="Ex: Caminhada, corrida" className={INPUT_CLASS} />
            </div>
          </div>
        </section>

        <MedicalHistorySection form={form} onChange={handleChange} />
        <PodologicalSection form={form} onChange={handleChange} />

        {/* Observações */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-700">Observações</h2>
          <div>
            <label htmlFor="otherObservations" className="block text-sm font-medium text-gray-700 mb-1">Outras observações</label>
            <textarea id="otherObservations" name="otherObservations" rows={4} value={form.otherObservations} onChange={handleChange} placeholder="Observações adicionais..." className={INPUT_CLASS} />
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={navigateBack}>Cancelar</Button>
          <Button type="submit" isLoading={isSubmitting} icon={<Save size={16} />}>
            {isEditMode ? 'Salvar alterações' : 'Salvar anamnese'}
          </Button>
        </div>
      </form>
    </div>
    </ErrorBoundary>
  );
};

export default CadastroAnamnesePage;
