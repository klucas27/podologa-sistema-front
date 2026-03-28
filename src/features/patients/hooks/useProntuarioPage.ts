import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { Patient, Anamnesis, Appointment } from "@/types";

export function useProntuarioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [anamnesis, setAnamnesis] = useState<Anamnesis | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anamnesisOpen, setAnamnesisOpen] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(
    null,
  );

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [patientRes, anamnesisRes, appointmentsRes] = await Promise.all([
        api.get<{ data: Patient }>(`/api/patients/${id}`),
        api.get<{ data: Anamnesis[] }>(`/api/anamneses/patient/${id}`),
        api.get<{ data: Appointment[] }>(`/api/appointments/patient/${id}`),
      ]);
      setPatient(patientRes.data);
      setAnamnesis(
        anamnesisRes.data.length > 0 ? anamnesisRes.data[0]! : null,
      );
      setAppointments(appointmentsRes.data);
    } catch {
      navigate("/pacientes");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
