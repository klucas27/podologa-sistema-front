/**
 * reportWebVitals — coleta e reporta Core Web Vitals.
 *
 * ## Métricas coletadas:
 * - LCP (Largest Contentful Paint): meta < 2.5s
 *   Mede quando o maior elemento visível (título, imagem hero) renderiza.
 *   Code splitting reduz LCP separando o bundle principal.
 *
 * - FID (First Input Delay): meta < 100ms
 *   Mede o tempo entre o primeiro clique/toque e a resposta do browser.
 *   Debounce em search inputs e React.memo reduzem o main thread blocking.
 *
 * - CLS (Cumulative Layout Shift): meta < 0.1
 *   Mede deslocamentos visuais inesperados durante o carregamento.
 *   Skeleton screens com dimensões fixas eliminam layout shifts.
 *
 * - INP (Interaction to Next Paint): substitui FID desde março 2024
 *   Mede a latência de TODAS as interações, não só a primeira.
 *
 * - TTFB (Time to First Byte): meta < 800ms
 *   Performance do servidor / CDN.
 *
 * ## Como usar:
 * Chamado em main.tsx após o render. Em dev, loga no console.
 * Em prod, enviar para analytics (ex: Google Analytics, Datadog).
 *
 * ## Pipeline CI:
 * ```yaml
 * # .github/workflows/lighthouse.yml
 * - uses: treosh/lighthouse-ci-action@v12
 *   with:
 *     urls: |
 *       https://app.podosistema.com/login
 *       https://app.podosistema.com/dashboard
 *     budgetPath: ./lighthouse-budget.json
 *     temporaryPublicStorage: true
 * ```
 */

import type { Metric } from 'web-vitals';

type ReportHandler = (metric: Metric) => void;

const defaultHandler: ReportHandler = (metric) => {
  // Em desenvolvimento: log no console com cores por status
  const thresholds: Record<string, number> = {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    INP: 200,
    TTFB: 800,
  };

  const threshold = thresholds[metric.name];
  const status = threshold && metric.value <= threshold ? '✅' : '⚠️';

  console.log(
    `${status} ${metric.name}: ${metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)}${metric.name === 'CLS' ? '' : 'ms'}`,
    { id: metric.id, rating: metric.rating },
  );
};

export function reportWebVitals(onReport: ReportHandler = defaultHandler): void {
  // Import dinâmico: web-vitals não entra no bundle principal.
  // Só carregado APÓS o first render (não impacta LCP).
  import('web-vitals').then(({ onLCP, onCLS, onINP, onTTFB }) => {
    onLCP(onReport);
    // FID removido no web-vitals v4 — substituído por INP (março 2024)
    onCLS(onReport);
    onINP(onReport);
    onTTFB(onReport);
  });
}
