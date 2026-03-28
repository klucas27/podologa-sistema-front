import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/**
 * Protege rotas verificando autenticação e (opcionalmente) role.
 *
 * O QUÊ: Exibe um spinner enquanto `isLoading`, redireciona para
 *        `/login` se não autenticado, e para `/acesso-negado` se
 *        a role do usuário não está na lista permitida.
 *
 * POR QUÊ: Sem o loading state, existe risco de "FOUC de auth" —
 *          o usuário vê brevemente conteúdo protegido antes do
 *          redirect, o que pode vazar informações sensíveis e
 *          gerar confusão na UX.
 *
 * RISCO MITIGADO: Flash de conteúdo protegido (FOUC de auth) e
 *                 acesso não autorizado a funcionalidades restritas.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
