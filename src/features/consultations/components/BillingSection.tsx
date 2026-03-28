import React from "react";
import { DollarSign } from "lucide-react";
import Button from "@/components/ui/Button";
import { PAYMENT_METHOD_OPTIONS } from "../constants";
import type { Billing, PaymentMethod } from "@/types";

interface BillingSectionProps {
  isClinicalEditable: boolean;
  existingBilling: Billing | null;
  billingAmount: string;
  onBillingAmountChange: (v: string) => void;
  billingPaymentMethod: PaymentMethod;
  onBillingPaymentMethodChange: (v: PaymentMethod) => void;
  billingPaidNow: boolean;
  onBillingPaidNowChange: (v: boolean) => void;
  isSavingBilling: boolean;
  onSaveBilling: () => void;
}

const BillingSection: React.FC<BillingSectionProps> = ({
  isClinicalEditable,
  existingBilling,
  billingAmount,
  onBillingAmountChange,
  billingPaymentMethod,
  onBillingPaymentMethodChange,
  billingPaidNow,
  onBillingPaidNowChange,
  isSavingBilling,
  onSaveBilling,
}) => (
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
          onChange={(e) => onBillingAmountChange(e.target.value)}
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
          onChange={(e) =>
            onBillingPaymentMethodChange(e.target.value as PaymentMethod)
          }
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

    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="billingPaid"
        checked={billingPaidNow}
        onChange={(e) => onBillingPaidNowChange(e.target.checked)}
        disabled={!isClinicalEditable}
        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
      />
      <label htmlFor="billingPaid" className="text-sm text-gray-700">
        Marcar como pago agora
      </label>
    </div>

    {isClinicalEditable && (
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={onSaveBilling}
          isLoading={isSavingBilling}
        >
          {existingBilling ? "Atualizar Cobrança" : "Salvar Cobrança"}
        </Button>
      </div>
    )}

    {existingBilling && (
      <p className="text-xs text-gray-400">
        Status:{" "}
        {existingBilling.status === "pending"
          ? "Pendente"
          : existingBilling.status === "paid"
            ? "Pago"
            : existingBilling.status === "cancelled"
              ? "Cancelado"
              : "Reembolsado"}
      </p>
    )}
  </div>
);

export default BillingSection;
