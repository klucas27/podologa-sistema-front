import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import type { ToastType } from "@/stores/ui.store";

const TOAST_STYLES: Record<ToastType, { bg: string; icon: typeof CheckCircle; iconColor: string }> = {
  success: { bg: "bg-green-50 border-green-200", icon: CheckCircle, iconColor: "text-green-500" },
  error: { bg: "bg-red-50 border-red-200", icon: XCircle, iconColor: "text-red-500" },
  warning: { bg: "bg-amber-50 border-amber-200", icon: AlertTriangle, iconColor: "text-amber-500" },
  info: { bg: "bg-blue-50 border-blue-200", icon: Info, iconColor: "text-blue-500" },
};

const TEXT_COLORS: Record<ToastType, { title: string; message: string }> = {
  success: { title: "text-green-800", message: "text-green-600" },
  error: { title: "text-red-800", message: "text-red-600" },
  warning: { title: "text-amber-800", message: "text-amber-600" },
  info: { title: "text-blue-800", message: "text-blue-600" },
};

const TOAST_TITLES: Record<ToastType, string> = {
  success: "Sucesso",
  error: "Erro",
  warning: "Atenção",
  info: "Informação",
};

const ToastContainer: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        const colors = TEXT_COLORS[toast.type];
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            role="alert"
            className={`${style.bg} border rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-top-2`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`${style.iconColor} flex-shrink-0 mt-0.5`} size={18} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${colors.title}`}>
                  {TOAST_TITLES[toast.type]}
                </p>
                <p className={`text-sm mt-0.5 ${colors.message}`}>
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
