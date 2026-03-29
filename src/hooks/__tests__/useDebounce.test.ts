import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna o valor inicial imediatamente', () => {
    // Arrange
    const initialValue = 'hello';

    // Act
    const { result } = renderHook(() => useDebounce(initialValue));

    // Assert
    expect(result.current).toBe('hello');
  });

  it('não atualiza o valor antes do delay', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } },
    );

    // Act
    rerender({ value: 'updated' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Assert
    expect(result.current).toBe('initial');
  });

  it('atualiza o valor após o delay', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } },
    );

    // Act
    rerender({ value: 'updated' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert
    expect(result.current).toBe('updated');
  });

  it('reseta o timer quando o valor muda antes do delay', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } },
    );

    // Act — muda antes do delay expirar
    rerender({ value: 'second' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: 'third' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Assert — ainda não atualizou porque resetou
    expect(result.current).toBe('first');

    // Act — completa o delay do último valor
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Assert
    expect(result.current).toBe('third');
  });

  it('usa delay padrão de 300ms', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } },
    );

    // Act
    rerender({ value: 'updated' });
    act(() => {
      vi.advanceTimersByTime(299);
    });

    // Assert — 299ms não é suficiente
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Assert — 300ms total, agora atualiza
    expect(result.current).toBe('updated');
  });

  it('aceita delay customizado', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } },
    );

    // Act
    rerender({ value: 'updated' });
    act(() => {
      vi.advanceTimersByTime(499);
    });

    // Assert
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Assert
    expect(result.current).toBe('updated');
  });
});
