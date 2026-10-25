import React from "react";
import { ArrowLeft, ClipboardPlus, Pencil, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { useProntuarioPage, type ProntuarioTab } from "../hooks/useProntuarioPage";
import PatientCard from "../components/PatientCard";
import AnamnesisSection from "../components/AnamnesisSection";
import AppointmentHistory from "../components/AppointmentHistory";
import PatientProfessionalAccess from "../components/PatientProfessionalAccess";

const ProntuarioPageInner: React.FC = () => {
  const state = useProntuarioPage();
  const { role } = useAuth();

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!state.patient) return null;

  const tabs: { key: ProntuarioTab; label: string }[] = [
    { key: "dados", label: "Dados" },
    { key: "historico", label: "Histórico" },
    ...(state.showHealth ? [{ key: "saude" as const, label: "Saúde" }] : []),
  ];
  const canEditPatient = role === "admin" || role === "recepcao";

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
          {canEditPatient && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Pencil size={14} />}
              onClick={() => state.navigate(`/pacientes/${state.id}/editar`)}
            >
              Editar Cliente
            </Button>
          )}
          {state.showHealth && (
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
          )}
        </div>
      </div>

      <div role="tablist" aria-label="Seções do prontuário" className="flex gap-2 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={state.tab === t.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => state.setTab(t.key)}
            className={`min-h-11 px-4 -mb-px border-b-2 text-sm font-medium ${state.tab === t.key ? "border-primary-500 text-primary-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${state.tab}`} aria-labelledby={`tab-${state.tab}`} className="space-y-6">
        {state.tab === "dados" && (
          <>
            <PatientCard patient={state.patient} />
            {role === "admin" && <PatientProfessionalAccess patientId={state.id ?? ""} />}
          </>
        )}

        {state.tab === "historico" && (
          <AppointmentHistory
            appointments={state.appointments}
            expandedAppointment={state.expandedAppointment}
            onToggle={state.toggleAppointment}
          />
        )}

        {state.tab === "saude" && state.showHealth && (
          <AnamnesisSection
            anamnesis={state.anamnesis}
            isOpen={state.anamnesisOpen}
            onToggle={state.toggleAnamnesis}
            onNavigate={state.navigate}
            patientId={state.id ?? ""}
          />
        )}
      </div>
    </div>
  );
};

const ProntuarioPage: React.FC = () => (
  <ErrorBoundary featureName="Prontuário">
    <ProntuarioPageInner />
  </ErrorBoundary>
);

export default ProntuarioPage;
