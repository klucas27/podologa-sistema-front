import React from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Toast global que exibe feedback de rate limit (429).
 * Renderizado no App.tsx, fora do router.
 */
const RateLimitToast: React.FC = () => {
  const { rateLimitMessage, clearRateLimitMessage } = useAuth();

  if (!rateLimitMessage) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg bg-amber-50 border border-amber-200 shadow-lg animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-3">
        <span className="text-amber-500 text-lg">⚠</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800">Rate Limit</p>
          <p className="text-sm text-amber-600 mt-0.5">{rateLimitMessage}</p>
        </div>
        <button
          type="button"
          onClick={clearRateLimitMessage}
          className="text-amber-400 hover:text-amber-600 text-lg leading-none"
          aria-label="Fechar"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default RateLimitToast;
