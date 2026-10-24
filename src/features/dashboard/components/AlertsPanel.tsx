import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Inbox } from "lucide-react";

interface Props {
  stock?: { expiring: number; belowMin: number; shortages: number };
  pendingRequests: number | null; // null = perfil que não confirma pedidos
}

/** Alertas que pedem ação da recepção/dona: estoque e pedidos do link. */
const AlertsPanel: React.FC<Props> = ({ stock, pendingRequests }) => {
  if (!stock && pendingRequests === null) return null;
  const items: { to: string; text: string; count: number; icon: React.ReactNode }[] = [];
  if (pendingRequests !== null) items.push({ to: "/pedidos", text: "pedidos do link aguardando confirmação", count: pendingRequests, icon: <Inbox size={16} /> });
  if (stock) {
    items.push({ to: "/estoque", text: "lotes vencendo em 30 dias", count: stock.expiring, icon: <AlertTriangle size={16} /> });
    items.push({ to: "/estoque", text: "produtos abaixo do mínimo", count: stock.belowMin, icon: <AlertTriangle size={16} /> });
    items.push({ to: "/estoque", text: "faltas de produto nos atendimentos", count: stock.shortages, icon: <AlertTriangle size={16} /> });
  }

  return (
    <section aria-label="Alertas" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((i) => (
        <Link key={i.text} to={i.to}
          className={`flex items-center gap-2 min-h-11 rounded-lg border px-3 py-2 text-sm ${i.count > 0 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-gray-200 bg-white text-gray-500"}`}>
          {i.icon}<span className="font-bold">{i.count}</span><span>{i.text}</span>
        </Link>
      ))}
    </section>
  );
};

export default AlertsPanel;
