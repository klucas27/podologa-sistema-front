/**
 * HTTP client configurado para autenticação via cookie HTTP-only.
 *
 * - Todas as requisições enviam `credentials: "include"` para
 *   que o browser anexe os cookies automaticamente.
 * - Requisições de mutação (POST/PUT/PATCH/DELETE) enviam o
 *   header X-CSRF-Token quando disponível.
 * - Nenhum token é armazenado em localStorage/sessionStorage.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333"; 

let csrfToken: string | null = null;

/** Atualiza o CSRF token retornado pelo backend no login. */
export const setCsrfToken = (token: string | null): void => {
  csrfToken = token;
};

export const getCsrfToken = (): string | null => csrfToken;

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

async function request<T>(
  endpoint: string,
  options: RequestOptions & { body?: string } = {},
): Promise<T> {
  const { params, headers, ...rest } = options;

  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
  }

  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(
    rest.method ?? "GET",
  );

  const response = await fetch(url.toString(), {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(isMutation && csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      ...headers,
    },
  });

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
