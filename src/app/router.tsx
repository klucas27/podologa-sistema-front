import React, { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/stores/auth.store";
import { homePathFor } from "@/config/permissions";

// Auth — carregamento síncrono: são as primeiras páginas vistas (LCP crítico)
import LoginPage from "@/features/auth/pages/LoginPage";
import AcessoNegadoPage from "@/features/auth/pages/AcessoNegadoPage";

function RoleRedirect() {
  const role = useAuthStore((s) => s.role);
  return <Navigate to={homePathFor(role)} replace />;
}

// ─── Lazy-loaded pages ────────────────────────────────────────────
// React.lazy split cada página em chunk separado. Impacto no LCP:
// - Bundle principal cai de ~300kb para ~80kb (apenas shell + auth)
// - Cada página é carregada sob demanda (~15-50kb cada)
// - Navegação subsequente após first load é instantânea (Vite prefetch)
//
// Alternativa descartada: importação dinâmica com loading manual
//   — React.lazy + Suspense é a API oficial e integra com concurrent features.

const DashboardPage = React.lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const PacientesPage = React.lazy(() => import("@/features/patients/pages/PacientesPage"));
const CadastroPacientePage = React.lazy(() => import("@/features/patients/pages/CadastroPacientePage"));
const EditarPacientePage = React.lazy(() => import("@/features/patients/pages/EditarPacientePage"));
const ProntuarioPage = React.lazy(() => import("@/features/patients/pages/ProntuarioPage"));
const CadastroAnamnesePage = React.lazy(() => import("@/features/anamneses/pages/CadastroAnamnesePage"));
const AgendamentosPage = React.lazy(() => import("@/features/appointments/pages/AgendamentosPage"));
const ConsultasPage = React.lazy(() => import("@/features/consultations/pages/ConsultasPage"));
const NovaConsultaPage = React.lazy(() => import("@/features/consultations/pages/NovaConsultaPage"));
const ConsultationExecutionPage = React.lazy(() => import("@/features/consultations/pages/ConsultationExecutionPage"));
const PatologiasPage = React.lazy(() => import("@/features/pathologies/pages/PatologiasPage"));
const ProfissionaisPage = React.lazy(() => import("@/features/professionals/pages/ProfissionaisPage"));
const TransacoesPage = React.lazy(() => import("@/features/billing/pages/TransacoesPage"));
const ConfiguracoesPage = React.lazy(() => import("@/features/settings/pages/ConfiguracoesPage"));
const ServicosPage = React.lazy(() => import("@/features/services/pages/ServicosPage"));
const EstoquePage = React.lazy(() => import("@/features/stock/pages/EstoquePage"));
const EncaminhamentosPage = React.lazy(() => import("@/features/referrals/pages/EncaminhamentosPage"));
const UsuariosPage = React.lazy(() => import("@/features/users/pages/UsuariosPage"));
const PedidosPage = React.lazy(() => import("@/features/booking-requests/pages/PedidosPage"));
const PublicBookingPage = React.lazy(() => import("@/features/public-booking/pages/PublicBookingPage"));

// ─── Route → import map para prefetch no hover ───────────────────
// Exportado para que o NavLink no MainLayout possa chamar
// routeImportMap[path]() no onMouseEnter, carregando o chunk
// ANTES do clique (elimina percepção de delay na navegação).
export const routeImportMap: Record<string, () => Promise<unknown>> = {
  "/dashboard": () => import("@/features/dashboard/pages/DashboardPage"),
  "/pacientes": () => import("@/features/patients/pages/PacientesPage"),
  "/consultas": () => import("@/features/consultations/pages/ConsultasPage"),
  "/agendamentos": () => import("@/features/appointments/pages/AgendamentosPage"),
  "/profissionais": () => import("@/features/professionals/pages/ProfissionaisPage"),
  "/transacoes": () => import("@/features/billing/pages/TransacoesPage"),
  "/patologias": () => import("@/features/pathologies/pages/PatologiasPage"),
  "/configuracoes": () => import("@/features/settings/pages/ConfiguracoesPage"),
  "/servicos": () => import("@/features/services/pages/ServicosPage"),
  "/estoque": () => import("@/features/stock/pages/EstoquePage"),
  "/encaminhamentos": () => import("@/features/referrals/pages/EncaminhamentosPage"),
  "/usuarios": () => import("@/features/users/pages/UsuariosPage"),
  "/pedidos": () => import("@/features/booking-requests/pages/PedidosPage"),
};

const lazy = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<PageSkeleton />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/agendar/:slug",
    element: lazy(PublicBookingPage),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/acesso-negado",
    element: <AcessoNegadoPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <RoleRedirect /> },
          {
            element: <ProtectedRoute allowedRoles={["admin"]} />,
            children: [
              { path: "/dashboard", element: lazy(DashboardPage) },
              { path: "/profissionais", element: lazy(ProfissionaisPage) },
              { path: "/usuarios", element: lazy(UsuariosPage) },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["admin", "recepcao"]} />,
            children: [
              { path: "/servicos", element: lazy(ServicosPage) },
              { path: "/estoque", element: lazy(EstoquePage) },
              { path: "/encaminhamentos", element: lazy(EncaminhamentosPage) },
              { path: "/pedidos", element: lazy(PedidosPage) },
            ],
          },
          { path: "/pacientes", element: lazy(PacientesPage) },
          { path: "/pacientes/novo", element: lazy(CadastroPacientePage) },
          { path: "/pacientes/:id", element: lazy(ProntuarioPage) },
          { path: "/pacientes/:id/editar", element: lazy(EditarPacientePage) },
          {
            path: "/pacientes/:patientId/anamnese/nova",
            element: lazy(CadastroAnamnesePage),
          },
          { path: "/agendamentos", element: lazy(AgendamentosPage) },
          {
            element: <ProtectedRoute allowedRoles={["admin", "podologa"]} />,
            children: [{ path: "/patologias", element: lazy(PatologiasPage) }],
          },
          { path: "/consultas", element: lazy(ConsultasPage) },
          { path: "/consultas/nova", element: lazy(NovaConsultaPage) },
          {
            path: "/consultas/:appointmentId/execucao",
            element: lazy(ConsultationExecutionPage),
          },
          {
            element: <ProtectedRoute allowedRoles={["admin", "recepcao"]} />,
            children: [{ path: "/transacoes", element: lazy(TransacoesPage) }],
          },
          { path: "/configuracoes", element: lazy(ConfiguracoesPage) },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
