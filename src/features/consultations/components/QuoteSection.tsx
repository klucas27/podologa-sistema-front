import React, { useState } from "react";
import { FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import { useQuote, useSaveQuote } from "../hooks/useQuote";
import type { Quote, QuoteStatus } from "../services/quote.service";

const STATUS: [QuoteStatus, string][] = [["pending", "Pendente"], ["accepted", "Aceito"], ["declined", "Recusado"]];
const INPUT_CLASS = "w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition";
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const QuoteForm: React.FC<{ appointmentId: string; quote: Quote | null }> = ({ appointmentId, quote }) => {
  const [amount, setAmount] = useState(quote ? String(quote.amount).replace(".", ",") : "");
  const [description, setDescription] = useState(quote?.description ?? "");
  const [status, setStatus] = useState<QuoteStatus>(quote?.status ?? "pending");
  const [error, setError] = useState("");
  const save = useSaveQuote(appointmentId);

  const submit = () => {
    const value = Number(amount.trim().replace(",", "."));
    if (amount.trim() === "" || Number.isNaN(value) || value < 0) return setError("Informe o valor do orçamento.");
    if (description.length > 500) return setError("Descrição com até 500 caracteres.");
    setError("");
    save.mutate(
      { id: quote?.id ?? null, data: { amount: value, description: description.trim() || null, status } },
      { onError: (err) => setError((err as { message?: string })?.message || "Erro ao salvar orçamento.") },
    );
  };

  return (
    <div className="space-y-3">
      {error && <div role="alert" className="bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
      <div>
        <label htmlFor="quote-amount" className="block text-sm font-medium text-gray-700 mb-1">Valor proposto (R$) *</label>
        <input id="quote-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={INPUT_CLASS} placeholder="240,00" />
      </div>
      <div>
        <label htmlFor="quote-description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea id="quote-description" rows={2} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} className={INPUT_CLASS} placeholder="Ex.: tratamento em 4 sessões" />
      </div>
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-1">Resposta da cliente</legend>
        <div className="grid grid-cols-3 gap-2">
          {STATUS.map(([value, label]) => (
            <button key={value} type="button" aria-pressed={status === value} onClick={() => setStatus(value)}
              className={`min-h-11 rounded-lg border text-sm font-medium transition ${status === value ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-300 text-gray-600"}`}>
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="flex justify-end">
        <Button type="button" onClick={submit} isLoading={save.isPending}>{quote ? "Atualizar orçamento" : "Salvar orçamento"}</Button>
      </div>
    </div>
  );
};

/** Orçamento da avaliação podológica: podóloga/admin editam; recepção só lê. */
const QuoteSection: React.FC<{ appointmentId: string; canEdit: boolean }> = ({ appointmentId, canEdit }) => {
  const { data: quote = null, isLoading } = useQuote(appointmentId);

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3" aria-label="Orçamento">
      <h2 className="flex items-center gap-2 text-base font-semibold text-gray-700"><FileText size={18} className="text-primary-500" />Orçamento</h2>
      {isLoading ? (
        <p className="text-sm text-gray-400">Carregando…</p>
      ) : canEdit ? (
        <QuoteForm key={quote?.id ?? "new"} appointmentId={appointmentId} quote={quote} />
      ) : quote ? (
        <p className="text-sm text-gray-700">
          {brl(quote.amount)} · {STATUS.find(([v]) => v === quote.status)?.[1]}
          {quote.description && <span className="block text-gray-500">{quote.description}</span>}
        </p>
      ) : (
        <p className="text-sm text-gray-400">Sem orçamento registrado.</p>
      )}
    </section>
  );
};

export default QuoteSection;
