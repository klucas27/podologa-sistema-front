import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useConsultationAppointment,
  useConsultationEvolutions,
  useConsultationBillings,
  usePathologiesList,
  useUpdateAppointmentStatus,
  useUpdateAppointmentTimes,
  useSaveEvolution,
  useSaveBilling,
} from "./useConsultations";
import { consultationService } from "../services/consultation.service";
import type {
  AppointmentStatus,
  BodyPart,
  PaymentMethod,
  EvolutionPathology,
} from "@/types";

export interface PathologyRow {
  pathologyId: string;
  bodyPart: BodyPart;
  notes: string;
}

export function useConsultationExecutionPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  // React Query data
  const {
    data: appointment,
    isLoading: isLoadingAppointment,
  } = useConsultationAppointment(appointmentId ?? "");
  const { data: evolutions = [] } = useConsultationEvolutions(
    appointmentId ?? "",
  );
  const { data: billings = [] } = useConsultationBillings(
    appointmentId ?? "",
  );
  const { data: pathologies = [] } = usePathologiesList();

  const existingEvolution = evolutions.length > 0 ? evolutions[0]! : null;
  const existingBilling = billings.length > 0 ? billings[0]! : null;

  // Mutations
  const updateStatusMutation = useUpdateAppointmentStatus();
  const updateTimesMutation = useUpdateAppointmentTimes();
  const saveEvolutionMutation = useSaveEvolution();
  const saveBillingMutation = useSaveBilling();

  // Clinical evolution form
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [prescribedMedications, setPrescribedMedications] = useState("");
  const [homeCareRecommendations, setHomeCareRecommendations] = useState("");
  const [recommendedReturnDays, setRecommendedReturnDays] = useState("");

  // Pathology rows
  const [pathologyRows, setPathologyRows] = useState<PathologyRow[]>([]);

  // Billing form
  const [billingAmount, setBillingAmount] = useState("");
  const [billingPaymentMethod, setBillingPaymentMethod] =
    useState<PaymentMethod>("pix");
  const [billingPaidNow, setBillingPaidNow] = useState(true);

  // Time editing
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  // Messages
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Populate form from existing data
  useEffect(() => {
    if (existingEvolution) {
      setClinicalNotes(existingEvolution.clinicalNotes ?? "");
      setPrescribedMedications(existingEvolution.prescribedMedications ?? "");
      setHomeCareRecommendations(
        existingEvolution.homeCareRecommendations ?? "",
      );
      setRecommendedReturnDays(
        existingEvolution.recommendedReturnDays?.toString() ?? "",
      );
      if (
        existingEvolution.evolutionPathologies &&
        existingEvolution.evolutionPathologies.length > 0
      ) {
        setPathologyRows(
          existingEvolution.evolutionPathologies.map(
            (ep: EvolutionPathology) => ({
              pathologyId: ep.pathologyId,
              bodyPart: ep.bodyPart,
              notes: ep.notes ?? "",
            }),
          ),
        );
      }
    }
  }, [existingEvolution]);

  useEffect(() => {
    if (existingBilling) {
      setBillingAmount(existingBilling.amount?.toString() ?? "");
      setBillingPaymentMethod(existingBilling.paymentMethod);
      setBillingPaidNow(existingBilling.status === "paid");
    }
  }, [existingBilling]);

  useEffect(() => {
    if (appointment) {
      const s = appointment.scheduledStart
        ? new Date(appointment.scheduledStart)
        : null;
      const e = appointment.scheduledEnd
        ? new Date(appointment.scheduledEnd)
        : null;
      setEditStart(
        s
          ? `${String(s.getHours()).padStart(2, "0")}:${String(s.getMinutes()).padStart(2, "0")}`
          : "",
      );
      setEditEnd(
        e
          ? `${String(e.getHours()).padStart(2, "0")}:${String(e.getMinutes()).padStart(2, "0")}`
          : "",
      );
    }
  }, [appointment]);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  }, []);

  const updateStatus = useCallback(
    async (newStatus: AppointmentStatus) => {
      if (!appointmentId) return;
      setError("");
      try {
        await updateStatusMutation.mutateAsync({
          id: appointmentId,
          status: newStatus,
        });
        showSuccess(
          newStatus === "in_progress"
            ? "Consulta iniciada."
            : newStatus === "completed"
              ? "Consulta finalizada."
              : "Status atualizado.",
        );
      } catch (err: unknown) {
        const message =
          (err as { message?: string })?.message || "Erro ao atualizar status.";
        setError(message);
      }
    },
    [appointmentId, updateStatusMutation, showSuccess],
  );

  const saveTimes = useCallback(async () => {
    if (!appointmentId) return;
    setError("");
    if (!editStart || !editEnd) {
      setError("Informe os horários de início e término.");
      return;
    }
    const startIso =
      (appointment?.scheduledDate ?? "").slice(0, 10) +
      "T" +
      editStart +
      ":00";
    const endIso =
      (appointment?.scheduledDate ?? "").slice(0, 10) + "T" + editEnd + ":00";
    if (new Date(startIso) >= new Date(endIso)) {
      setError("O horário de término deve ser posterior ao de início.");
      return;
    }
    try {
      await updateTimesMutation.mutateAsync({
        id: appointmentId,
        scheduledStart: new Date(startIso).toISOString(),
        scheduledEnd: new Date(endIso).toISOString(),
      });
      showSuccess("Horários atualizados com sucesso.");
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ||
        "Erro ao atualizar horários.";
      setError(message);
    }
  }, [
    appointmentId,
    editStart,
    editEnd,
    appointment,
    updateTimesMutation,
    showSuccess,
  ]);

  const handleCancel = useCallback(async () => {
    if (!appointmentId) return;
    const ok = window.confirm("Tem certeza que deseja cancelar esta consulta?");
    if (!ok) return;
    await updateStatus("cancelled");
  }, [appointmentId, updateStatus]);

  const handleDelete = useCallback(async () => {
    if (!appointmentId) return;
    const ok = window.confirm(
      "Excluir permanentemente esta consulta? Esta ação não pode ser desfeita.",
    );
    if (!ok) return;
    try {
      await consultationService.deleteAppointment(appointmentId);
      navigate("/agendamentos");
    } catch {
      setError("Erro ao excluir consulta.");
    }
  }, [appointmentId, navigate]);

  const handleSaveBilling = useCallback(async () => {
    if (!appointmentId) return;
    if (!billingAmount || Number(billingAmount) <= 0) {
      setError("Informe um valor válido para a cobrança.");
      return;
    }
    setError("");
    try {
      await saveBillingMutation.mutateAsync({
        id: existingBilling?.id,
        data: {
          appointmentId,
          amount: Number(billingAmount),
          paymentMethod: billingPaymentMethod,
          status: billingPaidNow ? "paid" : "pending",
        },
      });
      showSuccess("Cobrança salva com sucesso.");
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message || "Erro ao salvar cobrança.";
      setError(message);
    }
  }, [
    appointmentId,
    billingAmount,
    billingPaymentMethod,
    billingPaidNow,
    existingBilling,
    saveBillingMutation,
    showSuccess,
  ]);

  const addPathologyRow = useCallback(() => {
    setPathologyRows((prev) => [
      ...prev,
      { pathologyId: "", bodyPart: "right_foot" as BodyPart, notes: "" },
    ]);
  }, []);

  const updatePathologyRow = useCallback(
    (idx: number, patch: Partial<PathologyRow>) => {
      setPathologyRows((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
      );
    },
    [],
  );

  const removePathologyRow = useCallback((idx: number) => {
    setPathologyRows((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSaveEvolution = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!appointmentId) return;
      setError("");
      setSuccessMessage("");

      try {
        let evolutionId: string;

        if (existingEvolution) {
          await saveEvolutionMutation.mutateAsync({
            id: existingEvolution.id,
            data: {
              appointmentId,
              clinicalNotes: clinicalNotes.trim() || "",
              prescribedMedications: prescribedMedications.trim() || "",
              homeCareRecommendations: homeCareRecommendations.trim() || "",
              recommendedReturnDays: recommendedReturnDays
                ? Number(recommendedReturnDays)
                : null,
              pathologies: [],
            },
          });
          evolutionId = existingEvolution.id;

          // Delete existing evolution pathologies and recreate
          if (existingEvolution.evolutionPathologies) {
            for (const ep of existingEvolution.evolutionPathologies) {
              await consultationService.deleteEvolutionPathology(
                ep.evolutionId,
                ep.pathologyId,
                ep.bodyPart,
              );
            }
          }
        } else {
          const result = await saveEvolutionMutation.mutateAsync({
            data: {
              appointmentId,
              clinicalNotes: clinicalNotes.trim() || "",
              prescribedMedications: prescribedMedications.trim() || "",
              homeCareRecommendations: homeCareRecommendations.trim() || "",
              recommendedReturnDays: recommendedReturnDays
                ? Number(recommendedReturnDays)
                : null,
              pathologies: [],
            },
          });
          evolutionId = (result as { id: string }).id;
        }

        // Create pathology associations
        const validRows = pathologyRows.filter((r) => r.pathologyId);
        for (const row of validRows) {
          await consultationService.createEvolutionPathology({
            evolutionId,
            pathologyId: row.pathologyId,
            bodyPart: row.bodyPart,
            notes: row.notes.trim() || null,
          });
        }

        showSuccess("Evolução clínica salva com sucesso.");
      } catch (err: unknown) {
        const message =
          (err as { message?: string })?.message ||
          "Erro ao salvar evolução clínica.";
        setError(message);
      }
    },
    [
      appointmentId,
      existingEvolution,
      clinicalNotes,
      prescribedMedications,
      homeCareRecommendations,
      recommendedReturnDays,
      pathologyRows,
      saveEvolutionMutation,
      showSuccess,
    ],
  );

  const status = appointment
    ? appointment.status
    : ("scheduled" as AppointmentStatus);
  const isEditable = status !== "completed" && status !== "cancelled";
  const isClinicalEditable = status === "in_progress";

  return {
    // Data
    appointment,
    pathologies,
    existingEvolution,
    existingBilling,
    isLoading: isLoadingAppointment,

    // Status
    status,
    isEditable,
    isClinicalEditable,
    isUpdatingStatus: updateStatusMutation.isPending,
    isSaving: saveEvolutionMutation.isPending || updateTimesMutation.isPending,
    isSavingBilling: saveBillingMutation.isPending,

    // Messages
    error,
    successMessage,

    // Clinical evolution form
    clinicalNotes,
    setClinicalNotes,
    prescribedMedications,
    setPrescribedMedications,
    homeCareRecommendations,
    setHomeCareRecommendations,
    recommendedReturnDays,
    setRecommendedReturnDays,

    // Pathology rows
    pathologyRows,
    addPathologyRow,
    updatePathologyRow,
    removePathologyRow,

    // Billing form
    billingAmount,
    setBillingAmount,
    billingPaymentMethod,
    setBillingPaymentMethod,
    billingPaidNow,
    setBillingPaidNow,

    // Time editing
    editStart,
    setEditStart,
    editEnd,
    setEditEnd,

    // Handlers
    updateStatus,
    saveTimes,
    handleCancel,
    handleDelete,
    handleSaveBilling,
    handleSaveEvolution,
    navigate,
  };
}
