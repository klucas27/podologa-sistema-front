import React from "react";
import { ArrowLeft, ClipboardPlus, Pencil, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useProntuarioPage } from "../hooks/useProntuarioPage";
import PatientCard from "../components/PatientCard";
import AnamnesisSection from "../components/AnamnesisSection";
import AppointmentHistory from "../components/AppointmentHistory";

const ProntuarioPageInner: React.FC = () => {
  const state = useProntuarioPage();

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!state.patient) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={18} />}
            onClick={() => state.navigate("/pacientes")}
          >
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Prontuário</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Pencil size={14} />}
            onClick={() => state.navigate(`/pacientes/${state.id}/editar`)}
          >
            Editar Paciente
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ClipboardPlus size={14} />}
            onClick={() =>
              state.navigate(`/pacientes/${state.id}/anamnese/nova`)
            }
          >
            {state.anamnesis ? "Editar Anamnese" : "Nova Anamnese"}
          </Button>
        </div>
      </div>

      <PatientCard patient={state.patient} />

      <AnamnesisSection
        anamnesis={state.anamnesis}
        isOpen={state.anamnesisOpen}
        onToggle={state.toggleAnamnesis}
        onNavigate={state.navigate}
        patientId={state.id ?? ""}
      />

      <AppointmentHistory
        appointments={state.appointments}
        expandedAppointment={state.expandedAppointment}
        onToggle={state.toggleAppointment}
      />
    </div>
  );
};

const ProntuarioPage: React.FC = () => (
  <ErrorBoundary featureName="Prontuário">
    <ProntuarioPageInner />
  </ErrorBoundary>
);

export default ProntuarioPage;
