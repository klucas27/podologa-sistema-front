import { env } from '@/config/env';

/**
 * Cliente do link público. Cookies da sessão de agendamento vão no
 * `credentials`, sem CSRF, sem renovar login e sem redirecionar ao painel.
 */
export class PublicApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'PublicApiError';
  }
}

interface Envelope<T> {
  data?: T;
  message?: string;
}

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const url = new URL(`${env.VITE_API_URL}${path}`, window.location.origin);
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let payload: Envelope<T> | null = null;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new PublicApiError(response.status, payload?.message || 'Não foi possível concluir. Tente novamente.');
  }

  return payload?.data as T;
}

export const publicApi = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
};
