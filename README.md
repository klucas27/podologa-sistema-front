# 🦶 PodoSistema — Front-end

Sistema de gestão para consultórios de **Podologia** construído com **React 19 + Vite + TypeScript + Tailwind CSS**.
Configurado como **PWA** (Progressive Web App) — instalável e com suporte offline.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação](#instalação)
3. [Scripts disponíveis](#scripts-disponíveis)
4. [Arquitetura de Pastas](#arquitetura-de-pastas)
5. [Design System](#design-system)
6. [Como adicionar uma nova página](#como-adicionar-uma-nova-página)
7. [Configurações importantes](#configurações-importantes)
8. [PWA](#pwa)
9. [Tecnologias](#tecnologias)

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|------------|---------------|
| Node.js    | 18+           |
| npm        | 9+            |

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/klucas27/podologa-sistema-front.git
cd podologa-sistema-front

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O sistema abrirá em **http://localhost:3000**.

---

## Scripts disponíveis

| Comando           | Descrição                                  |
|-------------------|--------------------------------------------|
| `npm run dev`     | Inicia o dev server (Vite) com HMR         |
| `npm run build`   | Type-check (tsc) + build de produção       |
| `npm run preview` | Serve o build de produção localmente       |

---

## Arquitetura de Pastas

O projeto segue princípios de **Clean Code / Clean Architecture** para separação de responsabilidades:

```
src/
├── assets/                  # Imagens, SVGs, fontes
├── components/              # Componentes reutilizáveis
│   ├── Dashboard/           # Componentes específicos do Dashboard
│   │   ├── MetricCard.tsx
│   │   ├── PatientFlowChart.tsx
│   │   └── UpcomingAppointments.tsx
│   ├── ProtectedRoute/      # Guard de autenticação
│   │   └── ProtectedRoute.tsx
│   └── ui/                  # Design system (Button, Input, Modal…)
├── contexts/                # React Contexts (estado global)
│   └── AuthContext.tsx
├── hooks/                   # Custom hooks
│   └── useAuth.ts
├── layouts/                 # Shells / Layouts de página
│   └── MainLayout.tsx       # Sidebar + Top bar + <Outlet />
├── pages/                   # Páginas (1 pasta por rota)
│   ├── Agendamentos/
│   ├── Configuracoes/
│   ├── Dashboard/
│   ├── Login/
│   ├── Pacientes/
│   └── Prontuarios/
├── routes/                  # Definição de rotas (React Router)
│   └── index.tsx
├── services/                # Camada de comunicação HTTP
│   └── api.ts
├── styles/                  # CSS global + Tailwind layers
│   └── index.css
├── types/                   # Interfaces e tipos TypeScript
│   ├── auth.ts
│   ├── models.ts
│   └── index.ts
└── utils/                   # Helpers e funções puras
```

### Princípios seguidos

- **Cada pasta de página é autocontida**: contém apenas o componente de página.
- **Componentes reutilizáveis** ficam em `components/` e podem ser importados por qualquer página.
- **Layouts** são wrappers de rota — contêm sidebar, top bar e `<Outlet />`.
- **Contexts/Hooks** encapsulam estado global (autenticação, tema, etc.).
- **Services** isolam toda comunicação HTTP; nenhum `fetch` direto em componentes.
- **Types** centralizam interfaces compartilhadas.
- **Aliases** `@/` apontam para `src/` — evitam `../../..` nos imports.

---

## Design System

### Paleta de Cores (Tailwind)

| Token          | Hex       | Uso                         |
|----------------|-----------|-----------------------------|
| `primary-500`  | `#0ABAB5` | Tiffany Blue — cor principal |
| `primary-50`   | `#e0f7f6` | Backgrounds suaves          |
| `primary-700`  | `#069490` | Texto em destaque           |
| `gray-50`      | `#f9fafb` | Background da aplicação     |
| `gray-800`     | `#1f2937` | Texto principal             |
| `success-500`  | `#10b981` | Confirmações / positivo     |
| `warning-500`  | `#f59e0b` | Alertas                     |
| `danger-500`   | `#ef4444` | Erros / destrutivo          |

### Tipografia

- **Fonte**: `Inter` (Google Fonts), fallback `system-ui`
- Tamanhos padrão do Tailwind + custom `2xs` (10px)

### Componentes CSS utilitários

Definidos em `src/styles/index.css` via `@layer components`:

| Classe           | Descrição                                       |
|------------------|-------------------------------------------------|
| `.card`          | Cartão branco com borda, radius e shadow        |
| `.card-body`     | Padding interno padrão (`p-5`)                  |
| `.badge`         | Pill base para status/tags                      |
| `.badge-primary` | Badge em azul tiffany                           |
| `.badge-success` | Badge em verde                                  |
| `.badge-warning` | Badge em amarelo                                |
| `.badge-danger`  | Badge em vermelho                               |

---

## Como adicionar uma nova página

### 1. Crie a pasta e o componente

```
src/pages/NovaPagina/NovaPaginaPage.tsx
```

```tsx
import React from 'react';

const NovaPaginaPage: React.FC = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold text-gray-800">Nova Página</h1>
    <p className="text-sm text-gray-500">Descrição da página.</p>
  </div>
);

export default NovaPaginaPage;
```

### 2. Registre a rota em `src/routes/index.tsx`

```tsx
import NovaPaginaPage from '@/pages/NovaPagina/NovaPaginaPage';

// Dentro do children do MainLayout:
{ path: '/nova-pagina', element: <NovaPaginaPage /> },
```

### 3. (Opcional) Adicione na Sidebar

Em `src/layouts/MainLayout.tsx`, adicione ao array `navItems`:

```tsx
import { FileText } from 'lucide-react';

{ to: '/nova-pagina', label: 'Nova Página', icon: FileText },
```

Pronto! A nova página já estará protegida, com sidebar e top bar.

---

## Configurações importantes

### `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [react(), VitePWA({ /* ... */ })],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 3000, open: true },
  build: { outDir: 'dist', sourcemap: true },
});
```

- **Plugin React** — Fast Refresh para TSX
- **Plugin PWA** — Service worker, manifest, cache de fontes Google
- **Alias** `@/` → `./src`
- Dev server na porta `3000`

### `tailwind.config.js`

- Content scan: `./index.html` + `./src/**/*.{ts,tsx}`
- Paleta estendida: `primary`, `gray`, `success`, `warning`, `danger`
- Font family: `Inter`
- Custom spacing (`18`, `88`), border-radius (`4xl`) e box-shadow (`card`)

### `tsconfig.json`

- Target: `ES2020`
- Module resolution: `bundler` (Vite)
- Path alias: `@/*` → `./src/*`
- Strict mode habilitado

### `postcss.config.js`

- Tailwind CSS + Autoprefixer

---

## PWA

O `vite-plugin-pwa` gera automaticamente:

- **Service Worker** (Workbox) com precache de todos os assets estáticos
- **Web App Manifest** com ícones, tema Tiffany Blue e orientação portrait
- **Cache de fontes** Google Fonts via runtime caching (CacheFirst, 365 dias)

Para testar a instalação PWA:

```bash
npm run build
npm run preview
```

Abra no Chrome → DevTools → Application → Manifest → clique em "Install".

> **Nota:** Coloque os ícones `pwa-192x192.png` e `pwa-512x512.png` na pasta `public/`.

---

## Tecnologias

| Tecnologia        | Versão | Propósito                  |
|-------------------|--------|----------------------------|
| React             | 19     | UI Library                 |
| TypeScript        | 5.6    | Tipagem estática           |
| Vite              | 7      | Build tool + dev server    |
| Tailwind CSS      | 3.4    | Utility-first CSS          |
| React Router      | 7      | Roteamento SPA             |
| Lucide React      | 0.576  | Iconografia                |
| Recharts          | 3.7    | Gráficos                   |
| vite-plugin-pwa   | 1.2    | PWA + Service Worker       |

---

## Licença

Projeto privado — uso interno.
