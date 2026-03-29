/**
 * Error Boundary com fallback por feature.
 *
 * Cada feature é envolvida em um ErrorBoundary com `featureName`
 * para que erros em "Pacientes" não derrubem "Dashboard".
 *
 * ⚠ SEGURANÇA: o error.message renderizado aqui é o da ApiError,
 * que já foi sanitizado pelo api.ts — NUNCA contém stack traces
 * ou detalhes técnicos do servidor.
 *
 * Alternativa descartada: React.Suspense para error handling
 * — Por quê: Suspense trata loading, NÃO erros. Error Boundaries
 *   são o único mecanismo React para capturar erros síncronos
 *   em render. Para erros async, React Query já fornece `error`
 *   no hook, e o QueryErrorResetBoundary permite retry.
 */

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(
      `[ErrorBoundary${this.props.featureName ? `: ${this.props.featureName}` : ""}]`,
      error,
      errorInfo,
    );
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-warning-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Algo deu errado
            {this.props.featureName && ` em ${this.props.featureName}`}
          </h2>
          <p className="text-sm text-gray-500 mb-4 max-w-md">
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition"
          >
            <RefreshCw size={16} />
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * QueryErrorBoundary: combina Error Boundary com QueryErrorResetBoundary.
 *
 * Quando o usuário clica "Tentar novamente", além de resetar o Error Boundary,
 * também reseta as queries que falharam — forçando um refetch automático.
 */
export const QueryErrorBoundary: React.FC<{
  children: React.ReactNode;
  featureName?: string;
}> = ({ children, featureName }) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary featureName={featureName}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};
