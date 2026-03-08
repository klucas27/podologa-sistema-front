import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

import LoginPage from "@/pages/Login/LoginPage";
import RegisterPage from "@/pages/Register/RegisterPage";
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import PacientesPage from "@/pages/Pacientes/PacientesPage";
import CadastroPacientePage from "@/pages/Pacientes/CadastroPacientePage";
import EditarPacientePage from "@/pages/Pacientes/EditarPacientePage";
import ProntuarioPage from "@/pages/Pacientes/ProntuarioPage";
import CadastroAnamnesePage from "@/pages/Anamneses/CadastroAnamnesePage";
import AgendamentosPage from "@/pages/Agendamentos/AgendamentosPage";
import PatologiasPage from "@/pages/Patologias/PatologiasPage";
import ConsultasPage from "@/pages/Consultas/ConsultasPage";
import NovaConsultaPage from "@/pages/Consultas/NovaConsultaPage";
import ConfiguracoesPage from "@/pages/Configuracoes/ConfiguracoesPage";

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
          { path: "/pacientes/:patientId/anamnese/nova", element: <CadastroAnamnesePage /> },
          { path: "/agendamentos", element: <AgendamentosPage /> },
          { path: "/patologias", element: <PatologiasPage /> },
          { path: "/consultas", element: <ConsultasPage /> },
          { path: "/consultas/nova", element: <NovaConsultaPage /> },
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
