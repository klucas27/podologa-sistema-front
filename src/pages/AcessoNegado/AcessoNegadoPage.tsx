import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";

const AcessoNegadoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <ShieldX size={64} className="text-danger-400 mb-6" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Você não tem permissão para acessar esta página.
        Entre em contato com o administrador se acredita que isso é um erro.
      </p>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="px-6 py-2.5 rounded-lg bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition"
      >
        Voltar ao Dashboard
      </button>
    </div>
  );
};

export default AcessoNegadoPage;
