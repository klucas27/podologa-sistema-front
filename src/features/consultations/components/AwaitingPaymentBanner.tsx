import React from "react";
import { Wallet } from "lucide-react";

const AwaitingPaymentBanner: React.FC = () => (
  <div role="status" className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
    <Wallet size={18} aria-hidden="true" />
    Atendimento finalizado — aguardando pagamento na recepção.
  </div>
);

export default AwaitingPaymentBanner;
