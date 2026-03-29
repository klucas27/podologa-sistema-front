/**
 * useDebounce — atrasa a propagação de um valor por N ms.
 *
 * Impacto no FID: sem debounce, cada keystroke dispara filter/query
 * que bloqueia o main thread (~5-15ms para filtragem de lista com
 * 200+ itens). A 60 WPM de digitação, são ~5 keystrokes/segundo →
 * ~75ms bloqueados/segundo → janks perceptíveis.
 *
 * Com debounce de 300ms, a filtragem roda apenas 1x após o usuário
 * parar de digitar, liberando o main thread para paint e input.
 *
 * Por que 300ms:
 * - < 200ms: muito agressivo, ainda filtra a cada 2 caracteres
 * - 300ms: equilíbrio — parece instantâneo sem desperdiçar CPU
 * - > 500ms: feedback lento, usuário percebe "lag"
 *
 * Alternativa descartada: lodash.debounce
 *   — Adiciona 4kb ao bundle para uma funcionalidade de 15 linhas.
 *   — useDebounce com useState + useEffect é idiomático React.
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
