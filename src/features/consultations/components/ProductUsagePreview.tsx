import React from "react";
import { Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { serviceService } from "@/features/services/services/service.service";

/** Produtos da ficha técnica que saem do estoque ao finalizar o atendimento. */
const ProductUsagePreview: React.FC<{ serviceId: string | null }> = ({ serviceId }) => {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["services", "products", serviceId],
    queryFn: () => serviceService.listProducts(serviceId ?? ""),
    enabled: !!serviceId,
  });

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-2" aria-label="Produtos que serão baixados">
      <h2 className="flex items-center gap-2 text-base font-semibold text-gray-700"><Package size={18} className="text-primary-500" />Produtos que serão baixados</h2>
      {isLoading ? (
        <p className="text-sm text-gray-400">Carregando…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum produto cadastrado na ficha deste serviço.</p>
      ) : (
        <ul className="text-sm text-gray-700 space-y-1">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2"><span>{i.name}</span><span className="text-gray-500">{i.quantity.toLocaleString("pt-BR")} {i.unit}</span></li>
          ))}
        </ul>
      )}
      <p className="text-xs text-gray-500">A baixa acontece automaticamente quando o atendimento é finalizado.</p>
    </section>
  );
};

export default ProductUsagePreview;
