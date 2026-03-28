import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import RateLimitToast from "@/components/ui/RateLimitToast";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RateLimitToast />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};
