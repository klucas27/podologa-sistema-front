import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiError } from '@/lib/api';
import { notifyError, notifySuccess, notifyWarning, notifyInfo } from '@/lib/notifications';
import { useUIStore } from '@/stores/ui.store';

describe('notifications', () => {
  beforeEach(() => {
    // Limpa toasts antes de cada teste
    useUIStore.getState().clearToasts();
  });

  describe('notifyError', () => {
    it('mapeia ApiError 400 para mensagem de dados inválidos', () => {
      // Arrange
      const error = new ApiError(400, 'Bad Request');

      // Act
      notifyError(error);

      // Assert
      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].type).toBe('error');
      expect(toasts[0].message).toBe('Dados inválidos. Verifique os campos e tente novamente.');
    });

    it('mapeia ApiError 401 para mensagem de sessão expirada', () => {
      // Arrange
      const error = new ApiError(401, 'Unauthorized');

      // Act
      notifyError(error);

      // Assert
      const toasts = useUIStore.getState().toasts;
      expect(toasts[0].message).toBe('Sessão expirada, faça login novamente.');
    });

    it('mapeia ApiError 403 para mensagem de permissão negada', () => {
      // Arrange
      const error = new ApiError(403, 'Forbidden');

      // Act
      notifyError(error);

      // Assert
      const toasts = useUIStore.getState().toasts;
      expect(toasts[0].message).toBe('Você não tem permissão para esta ação.');
    });

    it('mapeia ApiError 429 como warning', () => {
      // Arrange
      const error = new ApiError(429, 'Too Many Requests');

      // Act
      notifyError(error);

      // Assert
      const toasts = useUIStore.getState().toasts;
      expect(toasts[0].type).toBe('warning');
      expect(toasts[0].message).toBe('Muitas tentativas, aguarde alguns segundos.');
    });

    it('mapeia ApiError 500 como error com mensagem genérica', () => {
      // Arrange
      const error = new ApiError(500, 'Internal stack trace leak');

      // Act
      notifyError(error);

      // Assert
      const toasts = useUIStore.getState().toasts;
      expect(toasts[0].type).toBe('error');
      expect(toasts[0].message).toBe('Erro interno, tente novamente.');
      // SEGURANÇA: nunca expõe detalhes técnicos
      expect(toasts[0].message).not.toContain('stack trace');
    });

    it('trata erros de rede com mensagem de conexão', () => {
      // Arrange
      const error = new Error('fetch failed');

      // Act
      notifyError(error);

      // Assert
      const toasts = useUIStore.getState().toasts;
      expect(toasts[0].message).toBe('Falha na conexão. Verifique sua internet.');
    });

    it('trata erros desconhecidos com mensagem genérica', () => {
      // Arrange
      const error = 'string error';

      // Act
      notifyError(error);

      // Assert
      const toasts = useUIStore.getState().toasts;
      expect(toasts[0].message).toBe('Erro inesperado. Tente novamente.');
    });
  });

  describe('notifySuccess', () => {
    it('cria toast de sucesso', () => {
      // Act
      notifySuccess('Paciente salvo com sucesso!');

      // Assert
      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Paciente salvo com sucesso!');
    });
  });

  describe('notifyWarning', () => {
    it('cria toast de warning', () => {
      // Act
      notifyWarning('Atenção: campos opcionais não preenchidos.');

      // Assert
      const toasts = useUIStore.getState().toasts;
      expect(toasts[0].type).toBe('warning');
    });
  });

  describe('notifyInfo', () => {
    it('cria toast informativo', () => {
      // Act
      notifyInfo('Sincronização concluída.');

      // Assert
      const toasts = useUIStore.getState().toasts;
      expect(toasts[0].type).toBe('info');
    });
  });
});
