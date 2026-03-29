import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// ─── Vite config otimizada para performance ──────────────────────
//
// ## Bundle strategy (manualChunks)
// O default do Vite coloca TUDO em 1-2 chunks. Problema:
// - Qualquer mudança no código invalida o cache do vendor bundle inteiro
// - First load baixa código de features que o usuário nunca vai acessar
//
// Com manualChunks, separamos:
// 1. vendor-react: React + ReactDOM (~45kb gzipped) — muda raramente
// 2. vendor-query: React Query + axios (~20kb gzipped) — muda pouco
// 3. vendor-charts: Recharts + D3 (~80kb gzipped) — só carregado no dashboard
// 4. vendor-ui: lucide-react + forms (~15kb gzipped)
// 5. Cada feature page: chunk próprio via React.lazy (~5-30kb cada)
//
// Impacto esperado:
// - LCP: -40% (bundle principal ~80kb vs ~300kb anterior)
// - Cache hit rate: ~95% (vendor chunks são long-lived)
// - Navigation: <100ms (chunks das pages já prefetchados no hover)

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'PodoSistema — Gestão de Podologia',
        short_name: 'PodoSistema',
        description: 'Sistema completo de gestão para consultórios de Podologia',
        theme_color: '#0ABAB5',
        background_color: '#f9fafb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    // Sourcemaps desabilitados em prod para reduzir tamanho do deploy.
    // Para debug em prod, usar Sentry ou similar com upload separado.
    sourcemap: false,
    // Target moderno: elimina polyfills desnecessários (~5kb savings)
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Vendor: React core ──
          // React + ReactDOM + scheduler + react-router
          // Muda ~1x/ano. Cache quase permanente.
          if (id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react/') ||
              id.includes('node_modules/scheduler') ||
              id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          // ── Vendor: Data layer ──
          // React Query + Zustand + Axios
          if (id.includes('node_modules/@tanstack/react-query') ||
              id.includes('node_modules/zustand') ||
              id.includes('node_modules/axios')) {
            return 'vendor-query';
          }
          // ── Vendor: Charts (pesado, lazy-loaded via dashboard) ──
          // Recharts + D3 sub-modules (~80kb gzipped)
          // Só carregado quando o usuário acessa /dashboard
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          // ── Vendor: UI ──
          // Lucide icons + react-hook-form + zod
          if (id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform') ||
              id.includes('node_modules/zod')) {
            return 'vendor-ui';
          }
        },
      },
    },
    // Alerta se qualquer chunk ultrapassar 250kb (antes de gzip)
    chunkSizeWarningLimit: 250,
  },
});
