/**
 * Skeleton loading para data fetching.
 *
 * Alternativa descartada: spinner genérico (loading... com giratória)
 * — Por quê: spinners não informam a estrutura do conteúdo. Skeleton
 *   mostra o layout esperado, reduz Cumulative Layout Shift (CLS) e
 *   transmite percepção de velocidade. Estudos de UX mostram que
 *   skeletons reduzem perceived loading time em até 30%.
 */

import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded bg-gray-200 ${className}`}
    role="status"
    aria-label="Carregando..."
  />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = "",
}) => (
  <div className={`space-y-2 ${className}`} role="status" aria-label="Carregando...">
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`rounded-lg border border-gray-200 p-4 space-y-3 ${className}`}
    role="status"
    aria-label="Carregando..."
  >
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-20 rounded-md" />
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{
  rows?: number;
  cols?: number;
  className?: string;
}> = ({ rows = 5, cols = 4, className = "" }) => (
  <div className={`space-y-2 ${className}`} role="status" aria-label="Carregando...">
    {/* Header */}
    <div className="flex gap-4 pb-2 border-b border-gray-200">
      {Array.from({ length: cols }, (_, i) => (
        <Skeleton key={`h-${i}`} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIdx) => (
      <div key={rowIdx} className="flex gap-4 py-2">
        {Array.from({ length: cols }, (_, colIdx) => (
          <Skeleton key={`r-${rowIdx}-${colIdx}`} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

/** Skeleton de página inteira — usado como fallback do Suspense nas rotas lazy */
export const PageSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse" role="status" aria-label="Carregando página...">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
