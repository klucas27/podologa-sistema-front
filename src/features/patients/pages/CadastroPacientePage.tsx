import React from 'react';
import { ArrowLeft, Save, ClipboardPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useCadastroPacientePage } from '../hooks/useCadastroPacientePage';
import { PatientFormFields } from '../components/PatientFormFields';

const CadastroPacientePage: React.FC = () => {
  const {
    form, error, isSubmitting, redirectToAnamnesis,
    handleChange, handleSubmit, setRedirectToAnamnesis, goBack,
  } = useCadastroPacientePage();

  return (
    <ErrorBoundary featureName="Cadastro de Paciente">
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={18} />} onClick={goBack}>Voltar</Button>
        <h1 className="text-2xl font-bold text-gray-800">Novo Paciente</h1>
      </div>

      {error && <div className="p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <PatientFormFields form={form} onChange={handleChange} />

        {/* Ações */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button type="button" variant="secondary" onClick={goBack}>Cancelar</Button>
          <Button
            type="submit"
            variant="secondary"
            icon={<ClipboardPlus size={16} />}
            isLoading={isSubmitting && redirectToAnamnesis}
            onClick={() => setRedirectToAnamnesis(true)}
          >
            Salvar e Cadastrar Anamnese
          </Button>
          <Button
            type="submit"
            icon={<Save size={16} />}
            isLoading={isSubmitting && !redirectToAnamnesis}
            onClick={() => setRedirectToAnamnesis(false)}
          >
            Salvar
          </Button>
        </div>
      </form>
    </div>
    </ErrorBoundary>
  );
};

export default CadastroPacientePage;
