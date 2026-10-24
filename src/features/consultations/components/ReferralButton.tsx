import React, { useState } from "react";
import { ArrowRightLeft, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { ApiError } from "@/lib/api";
import { useCreateReferral } from "@/features/referrals/hooks/useReferrals";

/** "Encaminhar à podóloga": a recepção agenda depois pela tela de encaminhamentos. */
const ReferralButton: React.FC<{ appointmentId: string }> = ({ appointmentId }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const create = useCreateReferral();

  const close = () => { setOpen(false); setReason(""); setError(""); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = reason.trim();
    if (!text || text.length > 500) return setError("Descreva o motivo (até 500 caracteres).");
    create.mutate(
      { sourceAppointmentId: appointmentId, reason: text },
      {
        onSuccess: close,
        onError: (err) => setError(err instanceof ApiError && err.status === 409
          ? "Já existe encaminhamento aberto para este atendimento."
          : (err as { message?: string })?.message || "Erro ao encaminhar."),
      },
    );
  };

  return (
    <>
      <Button type="button" variant="secondary" className="min-h-11 w-full sm:w-auto" icon={<ArrowRightLeft size={16} />} onClick={() => setOpen(true)}>
        Encaminhar à podóloga
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" role="presentation">
          <div role="dialog" aria-modal="true" aria-label="Encaminhar à podóloga" className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full max-w-lg sm:mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Encaminhar à podóloga</h2>
              <button type="button" onClick={close} className="p-2 -m-2 rounded text-gray-400 hover:text-gray-600" aria-label="Fechar"><X size={20} /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              {error && <div role="alert" className="bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
              <div>
                <label htmlFor="referral-reason" className="block text-sm font-medium text-gray-700 mb-1">O que você observou? *</label>
                <textarea id="referral-reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base focus:ring-2 focus:ring-primary-400 outline-none" placeholder="Ex.: unha encravada no hálux direito" />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={close}>Cancelar</Button>
                <Button type="submit" isLoading={create.isPending}>Encaminhar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ReferralButton;
