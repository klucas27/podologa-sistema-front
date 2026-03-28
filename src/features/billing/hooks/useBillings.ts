import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "../services/billing.service";
import type { CreateBillingData } from "../services/billing.service";

export const billingKeys = {
  all: ["billings"] as const,
  list: (params?: Record<string, string>) =>
    [...billingKeys.all, "list", params] as const,
  detail: (id: string) => [...billingKeys.all, "detail", id] as const,
};

export function useBillings(params?: Record<string, string>) {
  return useQuery({
    queryKey: billingKeys.list(params),
    queryFn: () => billingService.list(params),
  });
}

export function useCreateBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBillingData) => billingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useUpdateBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateBillingData>;
    }) => billingService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useDeleteBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billingService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}
