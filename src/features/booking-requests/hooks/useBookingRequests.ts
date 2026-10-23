import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingRequestService } from "../services/bookingRequest.service";

export const bookingRequestKeys = {
  all: ["booking-requests"] as const,
};

function useInvalidateBookingRequests() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: bookingRequestKeys.all });
  };
}

export function useBookingRequests(enabled = true) {
  return useQuery({
    queryKey: bookingRequestKeys.all,
    queryFn: () => bookingRequestService.listPending(),
    refetchInterval: 60_000,
    enabled,
  });
}

export function useConfirmBookingRequest() {
  const invalidate = useInvalidateBookingRequests();
  return useMutation({
    mutationFn: (id: string) => bookingRequestService.confirm(id),
    onSuccess: invalidate,
  });
}

export function useDeclineBookingRequest() {
  const invalidate = useInvalidateBookingRequests();
  return useMutation({
    mutationFn: (id: string) => bookingRequestService.decline(id),
    onSuccess: invalidate,
  });
}
