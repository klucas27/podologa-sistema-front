import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  api,
  ApiError,
  setCsrfToken,
  getCsrfToken,
  setOnAuthFailure,
  setOnForbidden,
  setOnRateLimited,
} from '@/lib/api';

describe('api', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    setCsrfToken(null);
    setOnAuthFailure(null);
    setOnForbidden(null);
    setOnRateLimited(null);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('CSRF token', () => {
    it('armazena e recupera CSRF token em memória', () => {
      // Arrange & Act
      setCsrfToken('test-csrf-token');

      // Assert
      expect(getCsrfToken()).toBe('test-csrf-token');
    });

    it('limpa CSRF token quando definido com null', () => {
      // Arrange
      setCsrfToken('some-token');

      // Act
      setCsrfToken(null);

      // Assert
      expect(getCsrfToken()).toBeNull();
    });
  });

  describe('GET requests', () => {
    it('faz GET request e retorna dados', async () => {
      // Arrange
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [{ id: '1' }] }),
      });

      // Act
      const result = await api.get('/api/patients');

      // Assert
      expect(result).toEqual({ data: [{ id: '1' }] });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/patients'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        }),
      );
    });

    it('envia query params no GET', async () => {
      // Arrange
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      });

      // Act
      await api.get('/api/patients', { params: { page: '1', limit: '10' } });

      // Assert
      const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('limit=10');
    });
  });

  describe('mutation requests (POST/PUT/PATCH/DELETE)', () => {
    it('POST envia body e CSRF token no header', async () => {
      // Arrange
      setCsrfToken('my-csrf');
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: { id: '1' } }),
      });

      // Act
      await api.post('/api/patients', { fullName: 'João' });

      // Assert
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ fullName: 'João' }),
          headers: expect.objectContaining({
            'X-CSRF-Token': 'my-csrf',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('não envia CSRF token quando não definido', async () => {
      // Arrange
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      // Act
      await api.post('/api/patients', {});

      // Assert
      const headers = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
      expect(headers['X-CSRF-Token']).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('lança ApiError para respostas não-ok', async () => {
      // Arrange
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: () => Promise.resolve({ message: 'CPF já cadastrado' }),
      });

      // Act & Assert
      await expect(api.post('/api/patients', {})).rejects.toThrow(ApiError);
      await expect(api.post('/api/patients', {})).rejects.toThrow('CPF já cadastrado');
    });

    it('chama onForbidden callback em resposta 403', async () => {
      // Arrange
      const onForbiddenFn = vi.fn();
      setOnForbidden(onForbiddenFn);
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({}),
      });

      // Act & Assert
      await expect(api.get('/api/admin/users')).rejects.toThrow(ApiError);
      expect(onForbiddenFn).toHaveBeenCalledOnce();
    });

    it('chama onRateLimited callback com Retry-After em resposta 429', async () => {
      // Arrange
      const onRateLimitedFn = vi.fn();
      setOnRateLimited(onRateLimitedFn);
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'Retry-After': '30' }),
        json: () => Promise.resolve({}),
      });

      // Act & Assert
      await expect(api.get('/api/patients')).rejects.toThrow(ApiError);
      expect(onRateLimitedFn).toHaveBeenCalledWith(30);
    });
  });

  describe('401 refresh interceptor', () => {
    it('tenta refresh e retenta a request original em caso de 401', async () => {
      // Arrange
      let callCount = 0;
      globalThis.fetch = vi.fn().mockImplementation((url: string, options: RequestInit) => {
        if (url.includes('/api/auth/refresh')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({ data: { csrfToken: 'new-csrf' } }),
          });
        }
        callCount++;
        if (callCount === 1) {
          // Primeira chamada: 401
          return Promise.resolve({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: () => Promise.resolve({}),
          });
        }
        // Segunda chamada (retry): sucesso
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({ data: { id: '1', fullName: 'João' } }),
        });
      });

      // Act
      const result = await api.get('/api/patients/1');

      // Assert
      expect(result).toEqual({ data: { id: '1', fullName: 'João' } });
      expect(getCsrfToken()).toBe('new-csrf');
    });

    it('chama onAuthFailure quando refresh falha', async () => {
      // Arrange
      const onAuthFailureFn = vi.fn();
      setOnAuthFailure(onAuthFailureFn);
      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/auth/refresh')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({}),
          });
        }
        return Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: () => Promise.resolve({}),
        });
      });

      // Act & Assert
      await expect(api.get('/api/patients')).rejects.toThrow(ApiError);
      expect(onAuthFailureFn).toHaveBeenCalledOnce();
    });

    it('não tenta refresh para /api/auth/login', async () => {
      // Arrange
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      // Act & Assert
      await expect(
        api.post('/api/auth/login', { username: 'x', password: 'y' }),
      ).rejects.toThrow();

      // Assert — fetch chamado apenas 1x (sem refresh)
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
