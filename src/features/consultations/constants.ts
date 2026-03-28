import type { AppointmentStatus, BodyPart, PaymentMethod } from "@/types";

export const BODY_PART_OPTIONS: { value: BodyPart; label: string }[] = [
  { value: "right_foot", label: "Pé direito" },
  { value: "left_foot", label: "Pé esquerdo" },
  { value: "right_hand", label: "Mão direita" },
  { value: "left_hand", label: "Mão esquerda" },
];

export const BODY_PART_LABELS: Record<BodyPart, string> = {
  right_foot: "Pé direito",
  left_foot: "Pé esquerdo",
  right_hand: "Mão direita",
  left_hand: "Mão esquerda",
};

export const STATUS_LABELS: Record<
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

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "pix", label: "PIX" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "debit_card", label: "Cartão de Débito" },
  { value: "cash", label: "Dinheiro" },
  { value: "transfer", label: "Transferência" },
  { value: "other", label: "Outro" },
];

export const formatDate = (iso: string) => {
  const parts = iso.slice(0, 10).split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
