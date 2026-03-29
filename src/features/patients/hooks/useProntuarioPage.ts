import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePatient } from "./usePatients";
import { useAnamnesesByPatient } from "@/features/anamneses/hooks/useAnamneses";
import { useAppointmentsByPatient } from "@/features/appointments/hooks/useAppointments";

export function useProntuarioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anamnesisOpen, setAnamnesisOpen] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(
    null,
  );

  // React Query: substitui useEffect + api.get + Promise.all + useState
  const { data: patient = null, isLoading: isLoadingPatient } = usePatient(id ?? "");
  const { data: anamnesesList = [], isLoading: isLoadingAnamneses } = useAnamnesesByPatient(id ?? "");
  const { data: appointments = [], isLoading: isLoadingAppointments } = useAppointmentsByPatient(id ?? "");

  const anamnesis = anamnesesList.length > 0 ? anamnesesList[0]! : null;
  const isLoading = isLoadingPatient || isLoadingAnamneses || isLoadingAppointments;

  const toggleAnamnesis = useCallback(() => {
    setAnamnesisOpen((prev) => !prev);
  }, []);

  const toggleAppointment = useCallback(
    (apptId: string) => {
      setExpandedAppointment(expandedAppointment === apptId ? null : apptId);
    },
    [expandedAppointment],
  );

  return {
    id,
    patient,
    anamnesis,
    appointments,
    isLoading,
    anamnesisOpen,
    expandedAppointment,
    toggleAnamnesis,
    toggleAppointment,
    navigate,
  };
}
