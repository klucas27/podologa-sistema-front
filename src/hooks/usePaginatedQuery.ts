/**
 * Hooks genéricos para paginação cursor-based com useInfiniteQuery.
 *
 * POR QUE cursor-based ao invés de offset-based:
 * ────────────────────────────────────────────────
 * Offset-based (LIMIT 10 OFFSET 20) tem problemas:
 * 1. Dados inseridos entre pages causam duplicatas ou itens pulados
 * 2. Performance degrada: OFFSET 10000 = banco lê e descarta 10000 rows
 * 3. Não é estável para real-time: novas inserções alteram todas as páginas
 *
 * Cursor-based (WHERE id > cursor LIMIT 10) resolve todos:
 * 1. Cursor é estável — novas inserções não afetam páginas já carregadas
 * 2. Performance constante: o banco usa index direto, sem skip
 * 3. Funciona naturalmente com infinite scroll
 *
 * Alternativa descartada: React Query `useQuery` com page number
 * — Por quê: useInfiniteQuery gerencia o array de páginas automaticamente,
 *   acumula dados e fornece `fetchNextPage`/`hasNextPage` nativamente.
 *   Implementar isso manualmente com useQuery exigiria state manual.
 *
 * ⚠ NOTA: O backend precisa retornar `{ data: T[], nextCursor: string | null }`.
 * Quando o backend implementar cursor-based, os services precisam
 * adaptar o retorno para esse formato.
 */

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

// ── Types ───────────────────────────────────────────────────

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
}

export interface UsePaginatedQueryOptions<T> {
  queryKey: readonly unknown[];
  queryFn: (cursor?: string) => Promise<CursorPage<T>>;
  enabled?: boolean;
}

// ── Hook ────────────────────────────────────────────────────

export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
}: UsePaginatedQueryOptions<T>) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });

  // Dados achatados — todas as páginas concatenadas
  const flatData = query.data?.pages.flatMap((page) => page.data) ?? [];

  // Prefetch da próxima página (para onHover do botão "próxima")
  const prefetchNextPage = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      const lastPage = query.data?.pages[query.data.pages.length - 1];
      if (lastPage?.nextCursor) {
        queryClient.prefetchInfiniteQuery({
          queryKey,
          queryFn: ({ pageParam }) => queryFn(pageParam as string | undefined),
          initialPageParam: undefined as string | undefined,
          getNextPageParam: (lastPage: CursorPage<T>) => lastPage.nextCursor ?? undefined,
          pages: 1,
        });
      }
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.data, queryClient, queryKey, queryFn]);

  return {
    ...query,
    flatData,
    prefetchNextPage,
  };
}
