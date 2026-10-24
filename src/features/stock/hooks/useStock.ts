import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stockService } from "../services/stock.service";
import type { EntryInput, ExitInput, ProductInput } from "../services/stock.service";
import { notifySuccess } from "@/lib/notifications";

export const stockKeys = {
  all: ["stock"] as const,
  products: () => [...stockKeys.all, "products"] as const,
  alerts: () => [...stockKeys.all, "alerts"] as const,
};

export function useProducts() {
  return useQuery({ queryKey: stockKeys.products(), queryFn: () => stockService.listProducts() });
}

export function useStockAlerts() {
  return useQuery({ queryKey: stockKeys.alerts(), queryFn: () => stockService.alerts() });
}

/** Mutação que atualiza produtos e alertas e avisa com a mensagem dada. */
function useStockMutation<T>(fn: (data: T) => Promise<unknown>, message: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      notifySuccess(message);
    },
  });
}

export const useCreateProduct = () => useStockMutation((d: ProductInput) => stockService.createProduct(d), "Produto cadastrado.");
export const useUpdateProduct = () =>
  useStockMutation(({ id, data }: { id: string; data: Partial<ProductInput> }) => stockService.updateProduct(id, data), "Produto atualizado.");
export const useDeleteProduct = () => useStockMutation((id: string) => stockService.deleteProduct(id), "Produto removido.");
export const useRegisterEntry = () => useStockMutation((d: EntryInput) => stockService.registerEntry(d), "Entrada registrada.");
export const useRegisterExit = () => useStockMutation((d: ExitInput) => stockService.registerExit(d), "Saída registrada.");
export const useDiscardBatch = () => useStockMutation((id: string) => stockService.discardBatch(id), "Lote descartado.");
