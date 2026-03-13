import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  PlayCircle,
  FileText,
  Pill,
  Home,
  RotateCcw,
  Bug,
  DollarSign,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { api } from "@/services/api";
import type {
  Appointment,
  AppointmentStatus,
  Pathology,
  BodyPart,
  ClinicalEvolution,
  EvolutionPathology,
  Billing,
  PaymentMethod,
} from "@/types";

const BODY_PART_OPTIONS: { value: BodyPart; label: string }[] = [
  { value: "right_foot", label: "Pé direito" },
  { value: "left_foot", label: "Pé esquerdo" },
  { value: "right_hand", label: "Mão direita" },
  { value: "left_hand", label: "Mão esquerda" },
];

const BODY_PART_LABELS: Record<BodyPart, string> = {
  right_foot: "Pé direito",
  left_foot: "Pé esquerdo",
  right_hand: "Mão direita",
  left_hand: "Mão esquerda",
};

const STATUS_LABELS: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  scheduled: { label: "Agendada", className: "bg-blue-50 text-blue-700" },
  confirmed: { label: "Confirmada", className: "bg-cyan-50 text-cyan-700" },
  in_progress: {
    label: "Em atendimento",
    className: "bg-yellow-50 text-yellow-700",
  },
  cancelled: { label: "Cancelada", className: "bg-red-50 text-red-700" },
  completed: { label: "Concluída", className: "bg-green-50 text-green-700" },
};

const formatDate = (iso: string) => {
  const parts = iso.slice(0, 10).split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

interface PathologyRow {
  pathologyId: string;
  bodyPart: BodyPart;
  notes: string;
}

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "pix", label: "PIX" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "debit_card", label: "Cartão de Débito" },
  { value: "cash", label: "Dinheiro" },
  { value: "transfer", label: "Transferência" },
  { value: "other", label: "Outro" },
];

const ConsultationExecutionPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [pathologies, setPathologies] = useState<Pathology[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Existing evolution data (if consultation already has an evolution)
  const [existingEvolution, setExistingEvolution] =
    useState<ClinicalEvolution | null>(null);

  // Clinical evolution form
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [prescribedMedications, setPrescribedMedications] = useState("");
  const [homeCareRecommendations, setHomeCareRecommendations] = useState("");
  const [recommendedReturnDays, setRecommendedReturnDays] = useState("");

  // Pathology rows
  const [pathologyRows, setPathologyRows] = useState<PathologyRow[]>([]);

  // Billing
  const [existingBilling, setExistingBilling] = useState<Billing | null>(null);
  const [billingAmount, setBillingAmount] = useState("");
  const [billingPaymentMethod, setBillingPaymentMethod] = useState<PaymentMethod>("pix");
  const [billingPaidNow, setBillingPaidNow] = useState(true);
  const [isSavingBilling, setIsSavingBilling] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = useCallback(async () => {
    if (!appointmentId) return;
    setIsLoading(true);
    try {
      const [apptRes, pathRes] = await Promise.all([
        api.get<{ data: Appointment }>(`/api/appointments/${appointmentId}`),
        api.get<{ data: Pathology[] }>("/api/pathologies"),
      ]);
      setAppointment(apptRes.data);
      setPathologies(pathRes.data);

      // Load existing clinical evolutions for this appointment
      const evoRes = await api.get<{ data: ClinicalEvolution[] }>(
        `/api/clinical-evolutions/appointment/${appointmentId}`,
      );
      if (evoRes.data.length > 0) {
        const evo = evoRes.data[0]!;
        setExistingEvolution(evo);
        setClinicalNotes(evo.clinicalNotes ?? "");
        setPrescribedMedications(evo.prescribedMedications ?? "");
        setHomeCareRecommendations(evo.homeCareRecommendations ?? "");
        setRecommendedReturnDays(evo.recommendedReturnDays?.toString() ?? "");

        // Load existing pathology rows
        if (evo.evolutionPathologies && evo.evolutionPathologies.length > 0) {
          setPathologyRows(
            evo.evolutionPathologies.map((ep: EvolutionPathology) => ({
              pathologyId: ep.pathologyId,
              bodyPart: ep.bodyPart,
              notes: ep.notes ?? "",
            })),
          );
        }
      }

      // Load existing billing
      const billRes = await api.get<{ data: Billing[] }>(
        `/api/billings/appointment/${appointmentId}`,
      );
      if (billRes.data.length > 0) {
        const bill = billRes.data[0]!;
        setExistingBilling(bill);
        setBillingAmount(bill.amount?.toString() ?? "");
        setBillingPaymentMethod(bill.paymentMethod);
        setBillingPaidNow(bill.status === "paid");
      }
    } catch {
      navigate("/consultas");
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (newStatus: AppointmentStatus) => {
    if (!appointmentId) return;
    setIsUpdatingStatus(true);
    setError("");
    try {
      const res = await api.patch<{ data: Appointment }>(
        `/api/appointments/${appointmentId}`,
        {
          status: newStatus,
        },
      );
      setAppointment(res.data);
      setSuccessMessage(
        newStatus === "in_progress"
          ? "Consulta iniciada."
          : newStatus === "completed"
            ? "Consulta finalizada."
            : "Status atualizado.",
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message || "Erro ao atualizar status.";
      setError(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Update scheduled start/end times (allow editing during execution)
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

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

  const saveTimes = async () => {
    if (!appointmentId) return;
    setError("");
    if (!editStart || !editEnd) {
      setError("Informe os horários de início e término.");
      return;
    }
    const startIso =
      (appointment?.scheduledDate ?? "").slice(0, 10) + "T" + editStart + ":00";
    const endIso =
      (appointment?.scheduledDate ?? "").slice(0, 10) + "T" + editEnd + ":00";
    if (new Date(startIso) >= new Date(endIso)) {
      setError("O horário de término deve ser posterior ao de início.");
      return;
    }
    setIsSaving(true);
    try {
      await api.patch(`/api/appointments/${appointmentId}`, {
        scheduledStart: new Date(startIso).toISOString(),
        scheduledEnd: new Date(endIso).toISOString(),
      });
      await fetchData();
      setSuccessMessage("Horários atualizados com sucesso.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message || "Erro ao atualizar horários.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!appointmentId) return;
    const ok = window.confirm("Tem certeza que deseja cancelar esta consulta?");
    if (!ok) return;
    await updateStatus("cancelled");
  };

  const handleDelete = async () => {
    if (!appointmentId) return;
    const ok = window.confirm(
      "Excluir permanentemente esta consulta? Esta ação não pode ser desfeita.",
    );
    if (!ok) return;
    try {
      await api.delete(`/api/appointments/${appointmentId}`);
      navigate("/agendamentos");
    } catch {
      setError("Erro ao excluir consulta.");
    }
  };

  const handleSaveBilling = async () => {
    if (!appointmentId) return;
    if (!billingAmount || Number(billingAmount) <= 0) {
      setError("Informe um valor válido para a cobrança.");
      return;
    }
    setError("");
    setIsSavingBilling(true);
    try {
      if (existingBilling) {
        await api.patch(`/api/billings/${existingBilling.id}`, {
          amount: Number(billingAmount),
          paymentMethod: billingPaymentMethod,
          status: billingPaidNow ? "paid" : "pending",
          paidAt: billingPaidNow ? new Date().toISOString() : null,
        });
      } else {
        await api.post("/api/billings", {
          appointmentId,
          amount: Number(billingAmount),
          paymentMethod: billingPaymentMethod,
          status: billingPaidNow ? "paid" : "pending",
          paidAt: billingPaidNow ? new Date().toISOString() : null,
        });
      }
      setSuccessMessage("Cobrança salva com sucesso.");
      setTimeout(() => setSuccessMessage(""), 3000);
      await fetchData();
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message || "Erro ao salvar cobrança.";
      setError(message);
    } finally {
      setIsSavingBilling(false);
    }
  };

  const addPathologyRow = () => {
    setPathologyRows((prev) => [
      ...prev,
      { pathologyId: "", bodyPart: "right_foot", notes: "" },
    ]);
  };

  const updatePathologyRow = (idx: number, patch: Partial<PathologyRow>) => {
    setPathologyRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    );
  };

  const removePathologyRow = (idx: number) => {
    setPathologyRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveEvolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId) return;
    setError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      let evolutionId: string;

      if (existingEvolution) {
        // Update existing evolution
        await api.patch(`/api/clinical-evolutions/${existingEvolution.id}`, {
          clinicalNotes: clinicalNotes.trim() || null,
          prescribedMedications: prescribedMedications.trim() || null,
          homeCareRecommendations: homeCareRecommendations.trim() || null,
          recommendedReturnDays: recommendedReturnDays
            ? Number(recommendedReturnDays)
            : null,
        });
        evolutionId = existingEvolution.id;

        // Delete existing evolution pathologies and recreate
        if (existingEvolution.evolutionPathologies) {
          for (const ep of existingEvolution.evolutionPathologies) {
            await api.delete(
              `/api/evolution-pathologies/${ep.evolutionId}/${ep.pathologyId}/${ep.bodyPart}`,
            );
          }
        }
      } else {
        // Create new evolution
        const evoRes = await api.post<{ data: { id: string } }>(
          "/api/clinical-evolutions",
          {
            appointmentId,
            clinicalNotes: clinicalNotes.trim() || null,
            prescribedMedications: prescribedMedications.trim() || null,
            homeCareRecommendations: homeCareRecommendations.trim() || null,
            recommendedReturnDays: recommendedReturnDays
              ? Number(recommendedReturnDays)
              : null,
          },
        );
        evolutionId = evoRes.data.id;
      }

      // Create pathology associations
      const validRows = pathologyRows.filter((r) => r.pathologyId);
      for (const row of validRows) {
        await api.post("/api/evolution-pathologies", {
          evolutionId,
          pathologyId: row.pathologyId,
          bodyPart: row.bodyPart,
          notes: row.notes.trim() || null,
        });
      }

      setSuccessMessage("Evolução clínica salva com sucesso.");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reload data to refresh existingEvolution
      await fetchData();
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ||
        "Erro ao salvar evolução clínica.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!appointment) return null;

  const status =
    STATUS_LABELS[appointment.status] ?? STATUS_LABELS["scheduled"];
  const isEditable =
    appointment.status !== "completed" && appointment.status !== "cancelled";
  const isClinicalEditable = appointment.status === "in_progress";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/consultas")}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
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

      {/* Messages */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Appointment info card */}
      <section
        aria-labelledby="appointment-info-heading"
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 id="appointment-info-heading" className="sr-only">
          Informações da consulta
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Left: patient & schedule */}
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex-shrink-0">
                {appointment.patient?.fullName
                  ? appointment.patient.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "?"}
              </div>

              <div className="min-w-0">
                <p className="text-lg font-semibold text-gray-800 truncate">
                  {appointment.patient?.fullName ?? "Paciente sem nome"}
                </p>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {appointment.patient?.phoneNumber ?? "Contato não informado"}
                </p>

                <dl className="mt-3 grid grid-cols-1 gap-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <div>
                        <time
                          dateTime={(appointment.scheduledDate ?? "").slice(
                            0,
                            10,
                          )}
                        >
                          {formatDate(appointment.scheduledDate)}
                        </time>
                      </div>
                      <div className="text-sm text-gray-500">
                        <time dateTime={appointment.scheduledStart ?? ""}>
                          {formatTime(appointment.scheduledStart)}
                        </time>
                        {" — "}
                        <time dateTime={appointment.scheduledEnd ?? ""}>
                          {formatTime(appointment.scheduledEnd)}
                        </time>
                      </div>
                    </div>
                  </div>

                  {(appointment.actualStartTime ||
                    appointment.actualEndTime) && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="text-xs font-medium text-gray-700">
                        Real:
                      </span>
                      <div className="text-sm">
                        {appointment.actualStartTime ? (
                          <time dateTime={appointment.actualStartTime}>
                            {formatDate(appointment.actualStartTime)}{" "}
                            {formatTime(appointment.actualStartTime)}
                          </time>
                        ) : (
                          <span>—</span>
                        )}
                        {appointment.actualEndTime &&
                        appointment.actualEndTime !==
                          appointment.actualStartTime ? (
                          <span>
                            {" "}
                            —{" "}
                            <time dateTime={appointment.actualEndTime}>
                              {formatDate(appointment.actualEndTime)}{" "}
                              {formatTime(appointment.actualEndTime)}
                            </time>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <span
                role="status"
                aria-label={`Status: ${status.label}`}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
              >
                {status.label}
              </span>
              {(appointment.professional?.fullName || appointment.user?.professionalName) && (
                <div className="text-sm text-gray-500">
                  {appointment.professional?.fullName || appointment.user?.professionalName}
                </div>
              )}
            </div>

            {appointment.notes && (
              <p className="mt-3 text-sm text-gray-600 italic">
                {appointment.notes}
              </p>
            )}
          </div>

          {/* Right: actions & time editors */}
          <div className="flex-shrink-0 w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-3">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center">
              {(appointment.status === "scheduled" ||
                appointment.status === "confirmed") && (
                <div className="w-full sm:w-auto">
                  <Button
                    size="sm"
                    icon={<PlayCircle size={14} />}
                    onClick={() => updateStatus("in_progress")}
                    isLoading={isUpdatingStatus}
                    type="button"
                    className="w-full sm:w-auto"
                  >
                    Iniciar
                  </Button>
                </div>
              )}

              {appointment.status === "in_progress" && (
                <div className="w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<CheckCircle size={14} />}
                    onClick={() => updateStatus("completed")}
                    isLoading={isUpdatingStatus}
                    type="button"
                    className="w-full sm:w-auto"
                  >
                    Finalizar
                  </Button>
                </div>
              )}

              {appointment.patient && (
                <div className="w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      navigate(`/pacientes/${appointment.patientId}`)
                    }
                    type="button"
                    className="w-full sm:w-auto"
                  >
                    Prontuário
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-2 w-full bg-gray-50 p-3 rounded-lg">
              {isEditable ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label
                      className="text-sm text-gray-600"
                      htmlFor="editStart"
                    >
                      Início
                    </label>
                    <input
                      id="editStart"
                      aria-label="Horário de início"
                      type="time"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      className="w-full sm:w-28 px-2 py-1 rounded-lg border border-gray-300 text-sm outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-sm text-gray-600" htmlFor="editEnd">
                      Fim
                    </label>
                    <input
                      id="editEnd"
                      aria-label="Horário de término"
                      type="time"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      className="w-full sm:w-28 px-2 py-1 rounded-lg border border-gray-300 text-sm outline-none"
                    />
                  </div>

                  <div className="w-full sm:w-auto">
                    <Button
                      size="sm"
                      type="button"
                      onClick={saveTimes}
                      isLoading={isSaving}
                      className="w-full sm:w-auto"
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Horários não editáveis
                </div>
              )}

              {(appointment.status === "scheduled" ||
                appointment.status === "confirmed") && (
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <div className="w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="secondary"
                      type="button"
                      onClick={handleCancel}
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                  </div>
                  <div className="w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="danger"
                      type="button"
                      onClick={handleDelete}
                      className="w-full sm:w-auto"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Clinical evolution form */}
      <form onSubmit={handleSaveEvolution} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-primary-500" />
            <h2 className="text-base font-semibold text-gray-700">
              Evolução Clínica {existingEvolution ? "(Editando)" : ""}
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas clínicas
            </label>
            <textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={4}
              disabled={!isClinicalEditable}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Descreva os achados clínicos..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <Pill size={14} /> Medicamentos prescritos
              </span>
            </label>
            <textarea
              value={prescribedMedications}
              onChange={(e) => setPrescribedMedications(e.target.value)}
              rows={2}
              disabled={!isClinicalEditable}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Medicamentos receitados..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <Home size={14} /> Cuidados domiciliares
              </span>
            </label>
            <textarea
              value={homeCareRecommendations}
              onChange={(e) => setHomeCareRecommendations(e.target.value)}
              rows={2}
              disabled={!isClinicalEditable}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition resize-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Orientações e cuidados em casa..."
            />
          </div>

          <div className="sm:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1">
                <RotateCcw size={14} /> Retorno recomendado (dias)
              </span>
            </label>
            <input
              type="number"
              min={0}
              value={recommendedReturnDays}
              onChange={(e) => setRecommendedReturnDays(e.target.value)}
              disabled={!isClinicalEditable}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Ex.: 30"
            />
          </div>
        </div>

        {/* Pathologies */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug size={18} className="text-orange-500" />
              <h2 className="text-base font-semibold text-gray-700">
                Patologias Identificadas
              </h2>
            </div>
            {isClinicalEditable && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={addPathologyRow}
              >
                Adicionar
              </Button>
            )}
          </div>

          {pathologyRows.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">
              Nenhuma patologia adicionada.
            </p>
          ) : (
            <div className="space-y-3">
              {pathologyRows.map((row, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Patologia
                    </label>
                    {isClinicalEditable ? (
                      <select
                        aria-label="Selecionar patologia"
                        value={row.pathologyId}
                        onChange={(e) =>
                          updatePathologyRow(idx, {
                            pathologyId: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
                      >
                        <option value="">Selecione</option>
                        {pathologies.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-700">
                        {pathologies.find((p) => p.id === row.pathologyId)
                          ?.name ?? row.pathologyId}
                      </p>
                    )}
                  </div>
                  <div className="sm:w-40">
                    <label className="block text-xs text-gray-500 mb-1">
                      Local
                    </label>
                    {isClinicalEditable ? (
                      <select
                        aria-label="Selecionar local do corpo"
                        value={row.bodyPart}
                        onChange={(e) =>
                          updatePathologyRow(idx, {
                            bodyPart: e.target.value as BodyPart,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
                      >
                        {BODY_PART_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-700">
                        {BODY_PART_LABELS[row.bodyPart]}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Observação
                    </label>
                    {isClinicalEditable ? (
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) =>
                          updatePathologyRow(idx, { notes: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
                        placeholder="Opcional"
                      />
                    ) : (
                      <p className="text-sm text-gray-700">
                        {row.notes || "—"}
                      </p>
                    )}
                  </div>
                  {isClinicalEditable && (
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removePathologyRow(idx)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition"
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Billing / Cobrança */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-500" />
            <h2 className="text-base font-semibold text-gray-700">
              Cobrança {existingBilling ? "(Editando)" : ""}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={billingAmount}
                onChange={(e) => setBillingAmount(e.target.value)}
                disabled={!isClinicalEditable}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Ex.: 150.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de pagamento
              </label>
              <select
                aria-label="Método de pagamento"
                value={billingPaymentMethod}
                onChange={(e) => setBillingPaymentMethod(e.target.value as PaymentMethod)}
                disabled={!isClinicalEditable}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white disabled:bg-gray-50 disabled:text-gray-500"
              >
                {PAYMENT_METHOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={billingPaidNow}
              onChange={(e) => setBillingPaidNow(e.target.checked)}
              disabled={!isClinicalEditable}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-400 disabled:opacity-50"
            />
            <span className="text-sm font-medium text-gray-700">
              Pago no momento da consulta
            </span>
          </label>

          {isClinicalEditable && (
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleSaveBilling}
                isLoading={isSavingBilling}
              >
                {existingBilling ? "Atualizar Cobrança" : "Salvar Cobrança"}
              </Button>
            </div>
          )}

          {existingBilling && (
            <p className="text-xs text-gray-400">
              Status: {existingBilling.status === "pending" ? "Pendente" : existingBilling.status === "paid" ? "Pago" : existingBilling.status === "cancelled" ? "Cancelado" : "Reembolsado"}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <div className="w-full sm:w-auto">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/consultas")}
              className="w-full sm:w-auto"
            >
              Voltar
            </Button>
          </div>
          {isClinicalEditable && (
            <div className="w-full sm:w-auto">
              <Button
                type="submit"
                isLoading={isSaving}
                className="w-full sm:w-auto"
              >
                {existingEvolution ? "Atualizar Evolução" : "Salvar Evolução"}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ConsultationExecutionPage;
