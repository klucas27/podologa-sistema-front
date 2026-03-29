import React from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useEditarPacientePage } from '../hooks/useEditarPacientePage';
import { PatientFormFields } from '../components/PatientFormFields';

const EditarPacientePage: React.FC = () => {
  const { form, error, isLoading, isSubmitting, handleChange, handleProfessionalIdsChange, handleSubmit, goBack } = useEditarPacientePage();

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <ErrorBoundary featureName="Editar Paciente">
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={18} />} onClick={goBack}>Voltar</Button>
        <h1 className="text-2xl font-bold text-gray-800">Editar Paciente</h1>
      </div>

      {error && <div className="p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <PatientFormFields form={form} onChange={handleChange} onProfessionalIdsChange={handleProfessionalIdsChange} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={goBack}>Cancelar</Button>
          <Button type="submit" isLoading={isSubmitting} icon={<Save size={16} />}>Salvar alterações</Button>
        </div>
      </form>
    </div>
    </ErrorBoundary>
  );
};

export default EditarPacientePage;
