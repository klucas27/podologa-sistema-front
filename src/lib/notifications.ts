/**
 * Mapeamento centralizado de erros HTTP para mensagens amigáveis.
 *
 * ⚠ SEGURANÇA: NUNCA exponha detalhes técnicos ao usuário final.
 * Mensagens como "Column 'xyz' not found" ou stack traces revelam
 * informações sobre a estrutura interna (schema do banco, ORM usado,
 * versão do framework), facilitando ataques direcionados.
 *
 * O OWASP Top 10 classifica "Improper Error Handling" como vetor
 * de reconhecimento — atacantes usam mensagens de erro para mapear
 * superfícies de ataque.
 *
 * Padrão: erros 5xx SEMPRE retornam mensagem genérica.
 * Erros 4xx retornam mensagens específicas MAS sem detalhes internos.
 */

import { useUIStore } from "@/stores/ui.store";
import type { ToastType } from "@/stores/ui.store";
import { ApiError } from "@/lib/api";

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: "Dados inválidos. Verifique os campos e tente novamente.",
  401: "Sessão expirada, faça login novamente.",
  403: "Você não tem permissão para esta ação.",
  404: "Recurso não encontrado.",
  409: "Conflito: este registro já existe ou foi modificado.",
  422: "Dados não puderam ser processados. Verifique os campos.",
  429: "Muitas tentativas, aguarde alguns segundos.",
  500: "Erro interno, tente novamente.",
  502: "Servidor indisponível. Tente novamente em instantes.",
  503: "Serviço temporariamente indisponível.",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return HTTP_ERROR_MESSAGES[error.status] ?? "Erro inesperado. Tente novamente.";
  }

  if (error instanceof Error) {
    // Filtra mensagens técnicas — nunca expõe ao usuário
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return "Falha na conexão. Verifique sua internet.";
    }
  }

  return "Erro inesperado. Tente novamente.";
}

function getToastType(error: unknown): ToastType {
  if (error instanceof ApiError) {
    if (error.status === 429) return "warning";
    if (error.status >= 500) return "error";
  }
  return "error";
}

export function notifyError(error: unknown): void {
  useUIStore.getState().addToast({
    type: getToastType(error),
    message: getErrorMessage(error),
  });
}

export function notifySuccess(message: string): void {
  useUIStore.getState().addToast({
    type: "success",
    message,
  });
}

export function notifyWarning(message: string): void {
  useUIStore.getState().addToast({
    type: "warning",
    message,
  });
}

export function notifyInfo(message: string): void {
  useUIStore.getState().addToast({
    type: "info",
    message,
  });
}
