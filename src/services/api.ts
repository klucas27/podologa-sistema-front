/**
 * HTTP client configurado para autenticação via cookie HTTP-only.
 *
 * - Todas as requisições enviam `credentials: "include"` para
 *   que o browser anexe os cookies automaticamente.
 * - Requisições de mutação (POST/PUT/PATCH/DELETE) enviam o
 *   header X-CSRF-Token quando disponível.
 * - Nenhum token é armazenado em localStorage/sessionStorage.
 * - Interceptor de refresh: ao receber 401, tenta renovar o
 *   access token via /api/auth/refresh antes de falhar.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

// ── CSRF token (armazenado APENAS em memória JS) ────────────

let csrfToken: string | null = null;

/** Atualiza o CSRF token retornado pelo backend no login/refresh/me. */
export const setCsrfToken = (token: string | null): void => {
  csrfToken = token;
};

export const getCsrfToken = (): string | null => csrfToken;

// ── Refresh token queue ─────────────────────────────────────
// Evita múltiplas chamadas de refresh simultâneas quando várias
// requisições recebem 401 ao mesmo tempo.

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (value: boolean) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(success: boolean, error?: unknown): void {
  for (const promise of refreshQueue) {
    if (success) {
      promise.resolve(true);
    } else {
      promise.reject(error);
    }
  }
  refreshQueue = [];
}

/** Callback que o AuthContext registra para forçar sign out no frontend. */
let onAuthFailure: (() => void) | null = null;

export const setOnAuthFailure = (callback: (() => void) | null): void => {
  onAuthFailure = callback;
};

/** Callback para redirecionar quando 403 (acesso negado). */
let onForbidden: (() => void) | null = null;

export const setOnForbidden = (callback: (() => void) | null): void => {
  onForbidden = callback;
};

/** Callback para feedback visual de rate limit (429). */
let onRateLimited: ((retryAfter: number | null) => void) | null = null;

export const setOnRateLimited = (
  callback: ((retryAfter: number | null) => void) | null,
): void => {
  onRateLimited = callback;
};

// ── Request internals ───────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
  }
  return url.toString();
}

function buildHeaders(
  isMutation: boolean,
  extra?: HeadersInit,
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(isMutation && csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    ...(extra as Record<string, string>),
  };
}

interface RefreshResponse {
  data: { csrfToken: string };
}

/**
 * Tenta renovar o access token via refresh cookie.
 * Retorna true se bem-sucedido, false caso contrário.
 */
async function attemptRefresh(): Promise<boolean> {
  if (isRefreshing) {
    // Enfileira enquanto um refresh já está em andamento
    return new Promise<boolean>((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const res = await fetch(buildUrl("/api/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      processQueue(false, new Error("Refresh failed"));
      return false;
    }

    const body = (await res.json()) as RefreshResponse;
    setCsrfToken(body.data.csrfToken);
    processQueue(true);
    return true;
  } catch (err) {
    processQueue(false, err);
    return false;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Executa a requisição HTTP. Se receber 401 e o endpoint NÃO for
 * /api/auth/refresh nem /api/auth/login, tenta refresh e retry UMA vez.
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions & { body?: string } = {},
): Promise<T> {
  const { params, headers, ...rest } = options;

  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(
    rest.method ?? "GET",
  );

  const url = buildUrl(endpoint, params);

  const doFetch = (): Promise<Response> =>
    fetch(url, {
      ...rest,
      credentials: "include",
      headers: buildHeaders(isMutation, headers),
    });

  let response = await doFetch();

  // ── Interceptor: refresh automático em 401 ──────────────
  const skipRefreshEndpoints = ["/api/auth/login", "/api/auth/refresh", "/api/auth/register"];
  if (response.status === 401 && !skipRefreshEndpoints.includes(endpoint)) {
    const refreshed = await attemptRefresh();

    if (refreshed) {
      // Retry com novo access token (cookie atualizado pelo browser)
      response = await doFetch();
    } else {
      // Refresh falhou → sessão expirada, force logout no frontend
      onAuthFailure?.();
      throw new ApiError(401, "Sessão expirada. Faça login novamente.");
    }
  }

  // ── 403 Forbidden → redirecionar para página de acesso negado ──
  if (response.status === 403) {
    onForbidden?.();
    throw new ApiError(403, "Acesso negado.");
  }

  // ── 429 Rate Limited → feedback visual ao usuário ──
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    onRateLimited?.(retryAfter ? parseInt(retryAfter, 10) : null);
    throw new ApiError(429, "Muitas requisições. Aguarde um momento e tente novamente.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      (body as { message?: string }).message ||
      `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, message);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};

export { ApiError };
