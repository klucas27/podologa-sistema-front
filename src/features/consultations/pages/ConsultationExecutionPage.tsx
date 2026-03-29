import React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useConsultationExecutionPage } from "../hooks/useConsultationExecutionPage";
import AppointmentInfoCard from "../components/AppointmentInfoCard";
import ClinicalEvolutionSection from "../components/ClinicalEvolutionSection";
import PathologySection from "../components/PathologySection";
import BillingSection from "../components/BillingSection";

const ConsultationExecutionPageInner: React.FC = () => {
  const state = useConsultationExecutionPage();

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!state.appointment) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => state.navigate("/consultas")}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          title="consultas"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Execução da Consulta
          </h1>
          <p className="text-sm text-gray-500">
            Registre a evolução clínica e patologias identificadas.
          </p>
        </div>
      </div>

      {state.error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}
      {state.successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {state.successMessage}
        </div>
      )}

      <AppointmentInfoCard
        appointment={state.appointment}
        isEditable={state.isEditable}
        isUpdatingStatus={state.isUpdatingStatus}
        isSaving={state.isSaving}
        editStart={state.editStart}
        editEnd={state.editEnd}
        onEditStartChange={state.setEditStart}
        onEditEndChange={state.setEditEnd}
        onUpdateStatus={state.updateStatus}
        onSaveTimes={state.saveTimes}
        onCancel={state.handleCancel}
        onDelete={state.handleDelete}
        onNavigate={state.navigate}
      />

      <form onSubmit={state.handleSaveEvolution} className="space-y-6">
        <ClinicalEvolutionSection
          existingEvolution={state.existingEvolution}
          isClinicalEditable={state.isClinicalEditable}
          clinicalNotes={state.clinicalNotes}
          onClinicalNotesChange={state.setClinicalNotes}
          prescribedMedications={state.prescribedMedications}
          onPrescribedMedicationsChange={state.setPrescribedMedications}
          homeCareRecommendations={state.homeCareRecommendations}
          onHomeCareRecommendationsChange={state.setHomeCareRecommendations}
          recommendedReturnDays={state.recommendedReturnDays}
          onRecommendedReturnDaysChange={state.setRecommendedReturnDays}
        />

        <PathologySection
          isClinicalEditable={state.isClinicalEditable}
          pathologyRows={state.pathologyRows}
          pathologies={state.pathologies}
          onAdd={state.addPathologyRow}
          onUpdate={state.updatePathologyRow}
          onRemove={state.removePathologyRow}
        />

        <BillingSection
          isClinicalEditable={state.isClinicalEditable}
          existingBilling={state.existingBilling}
          billingAmount={state.billingAmount}
          onBillingAmountChange={state.setBillingAmount}
          billingPaymentMethod={state.billingPaymentMethod}
          onBillingPaymentMethodChange={state.setBillingPaymentMethod}
          billingPaidNow={state.billingPaidNow}
          onBillingPaidNowChange={state.setBillingPaidNow}
          isSavingBilling={state.isSavingBilling}
          onSaveBilling={state.handleSaveBilling}
        />

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <div className="w-full sm:w-auto">
            <Button
              variant="secondary"
              type="button"
              onClick={() => state.navigate("/consultas")}
              className="w-full sm:w-auto"
            >
              Voltar
            </Button>
          </div>
          {state.isClinicalEditable && (
            <div className="w-full sm:w-auto">
              <Button
                type="submit"
                isLoading={state.isSaving}
                className="w-full sm:w-auto"
              >
                {state.existingEvolution
                  ? "Atualizar Evolução"
                  : "Salvar Evolução"}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

const ConsultationExecutionPage: React.FC = () => (
  <ErrorBoundary featureName="Execução de Consulta">
    <ConsultationExecutionPageInner />
  </ErrorBoundary>
);

export default ConsultationExecutionPage;
