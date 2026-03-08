import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

import LoginPage from "@/pages/Login/LoginPage";
import RegisterPage from "@/pages/Register/RegisterPage";
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import PacientesPage from "@/pages/Pacientes/PacientesPage";
import AgendamentosPage from "@/pages/Agendamentos/AgendamentosPage";
import ProntuariosPage from "@/pages/Prontuarios/ProntuariosPage";
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
          { path: "/agendamentos", element: <AgendamentosPage /> },
          { path: "/prontuarios", element: <ProntuariosPage /> },
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
