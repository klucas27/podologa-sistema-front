import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { referralService } from "../services/referral.service";
import type { CreateReferralInput, ReferralStatus } from "../services/referral.service";
import { notifySuccess } from "@/lib/notifications";

export const referralKeys = {
  all: ["referrals"] as const,
  list: (status: ReferralStatus) => [...referralKeys.all, status] as const,
};

export function useReferrals(status: ReferralStatus) {
  return useQuery({ queryKey: referralKeys.list(status), queryFn: () => referralService.list(status) });
}

export function useCreateReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReferralInput) => referralService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referralKeys.all });
      notifySuccess("Cliente encaminhada à podóloga.");
    },
  });
}

export function useDeclineReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => referralService.decline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referralKeys.all });
      notifySuccess("Encaminhamento marcado como recusado.");
    },
  });
}
