import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

// Auth
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import AcessoNegadoPage from "@/features/auth/pages/AcessoNegadoPage";

// Dashboard
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

// Patients
import PacientesPage from "@/features/patients/pages/PacientesPage";
import CadastroPacientePage from "@/features/patients/pages/CadastroPacientePage";
import EditarPacientePage from "@/features/patients/pages/EditarPacientePage";
import ProntuarioPage from "@/features/patients/pages/ProntuarioPage";

// Anamneses
import CadastroAnamnesePage from "@/features/anamneses/pages/CadastroAnamnesePage";

// Appointments
import AgendamentosPage from "@/features/appointments/pages/AgendamentosPage";

// Consultations
import ConsultasPage from "@/features/consultations/pages/ConsultasPage";
import NovaConsultaPage from "@/features/consultations/pages/NovaConsultaPage";
import ConsultationExecutionPage from "@/features/consultations/pages/ConsultationExecutionPage";

// Pathologies
import PatologiasPage from "@/features/pathologies/pages/PatologiasPage";

// Professionals
import ProfissionaisPage from "@/features/professionals/pages/ProfissionaisPage";

// Billing
import TransacoesPage from "@/features/billing/pages/TransacoesPage";

// Settings
import ConfiguracoesPage from "@/features/settings/pages/ConfiguracoesPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
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
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/pacientes", element: <PacientesPage /> },
          { path: "/pacientes/novo", element: <CadastroPacientePage /> },
          { path: "/pacientes/:id", element: <ProntuarioPage /> },
          { path: "/pacientes/:id/editar", element: <EditarPacientePage /> },
          {
            path: "/pacientes/:patientId/anamnese/nova",
            element: <CadastroAnamnesePage />,
          },
          { path: "/agendamentos", element: <AgendamentosPage /> },
          { path: "/patologias", element: <PatologiasPage /> },
          { path: "/consultas", element: <ConsultasPage /> },
          { path: "/consultas/nova", element: <NovaConsultaPage /> },
          {
            path: "/consultas/:appointmentId/execucao",
            element: <ConsultationExecutionPage />,
          },
          { path: "/profissionais", element: <ProfissionaisPage /> },
          { path: "/transacoes", element: <TransacoesPage /> },
          { path: "/configuracoes", element: <ConfiguracoesPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
