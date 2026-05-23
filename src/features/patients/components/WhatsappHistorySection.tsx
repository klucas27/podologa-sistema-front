import React from "react";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useWhatsappHistory } from "@/features/settings/hooks/useWhatsappHistory";
import type { WhatsappMessage } from "@/types";

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

interface MessageBubbleProps {
  msg: WhatsappMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg }) => {
  const isOutbound = msg.direction === "outbound";
  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
          isOutbound
            ? "bg-primary-500 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        <p className={`text-xs mt-1 ${isOutbound ? "text-primary-100" : "text-gray-400"}`}>
          {formatTime(msg.createdAt)}
        </p>
      </div>
    </div>
  );
};

interface WhatsappHistorySectionProps {
  patientId: string;
  isOpen: boolean;
  onToggle: () => void;
}

const WhatsappHistorySection: React.FC<WhatsappHistorySectionProps> = ({
  patientId,
  isOpen,
  onToggle,
}) => {
  const { data: messages, isLoading } = useWhatsappHistory({
    patientId,
    limit: 10,
  });

  const count = messages?.length ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <MessageSquare size={20} className="text-primary-500" />
          <div>
            <p className="text-base font-semibold text-gray-700">WhatsApp</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isLoading
                ? "Carregando..."
                : count > 0
                ? `${count} mensagen${count !== 1 ? "s" : ""} recentes`
                : "Nenhuma mensagem registrada"}
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 px-6 py-4">
          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-4">Carregando mensagens...</p>
          ) : !messages?.length ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Nenhuma conversa via WhatsApp encontrada para este paciente.
            </p>
          ) : (
            <div className="space-y-2">
              {[...messages].reverse().map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhatsappHistorySection;
