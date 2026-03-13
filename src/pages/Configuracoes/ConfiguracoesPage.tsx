import React, { useState } from "react";
import { Lock, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

type TabKey = "security" | "workingHours";

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { key: "security", label: "Segurança", icon: <Lock size={16} /> },
  {
    key: "workingHours",
    label: "Horário de Trabalho",
    icon: <Clock size={16} />,
  },
];

/* ─── Security Tab ─── */
const SecurityTab: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não coincidem.");
      return;
    }

    setIsLoading(true);
    try {
      await api.patch("/api/auth/password", { currentPassword, newPassword });
      setSuccess("Senha alterada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : "Erro ao alterar senha.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && (
        <div className="flex items-center gap-2 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle size={16} className="flex-shrink-0" />
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Senha atual <span className="text-danger-500">*</span>
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
          placeholder="Digite sua senha atual"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nova senha <span className="text-danger-500">*</span>
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar nova senha <span className="text-danger-500">*</span>
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
          placeholder="Repita a nova senha"
        />
      </div>

      <Button type="submit" isLoading={isLoading}>
        Alterar Senha
      </Button>
    </form>
  );
};

/* ─── Working Hours Tab ─── */
const WorkingHoursTab: React.FC = () => {
  const { user } = useAuth();
  const [workdayStart, setWorkdayStart] = useState(
    user?.workdayStart ?? "08:00",
  );
  const [workdayEnd, setWorkdayEnd] = useState(user?.workdayEnd ?? "18:00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!workdayStart || !workdayEnd) {
      setError("Preencha os horários de início e fim.");
      return;
    }

    if (workdayStart >= workdayEnd) {
      setError("O horário de início deve ser anterior ao de término.");
      return;
    }

    setIsLoading(true);
    try {
      await api.patch("/api/auth/working-hours", { workdayStart, workdayEnd });
      setSuccess(
        "Horário de trabalho atualizado. Recarregue a página para aplicar no calendário.",
      );
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : "Erro ao atualizar horários.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && (
        <div className="flex items-center gap-2 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle size={16} className="flex-shrink-0" />
          {success}
        </div>
      )}

      <p className="text-sm text-gray-500">
        Defina o horário de expediente. O calendário de agendamentos exibirá
        apenas os horários dentro deste intervalo.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Início do expediente
          </label>
          <input
            type="time"
            value={workdayStart}
            onChange={(e) => setWorkdayStart(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fim do expediente
          </label>
          <input
            type="time"
            value={workdayEnd}
            onChange={(e) => setWorkdayEnd(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
          />
        </div>
      </div>

      <Button type="submit" isLoading={isLoading}>
        Salvar Horários
      </Button>
    </form>
  );
};

/* ─── Main Page ─── */
const ConfiguracoesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("security");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
        <p className="text-sm text-gray-500">Personalize o sistema.</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary-500 text-primary-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "workingHours" && <WorkingHoursTab />}
      </div>
    </div>
  );
};

export default ConfiguracoesPage;
