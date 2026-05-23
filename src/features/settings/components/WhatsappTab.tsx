import React, { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useWhatsappStatus } from '../hooks/useWhatsappStatus';
import { useWhatsappHistory } from '../hooks/useWhatsappHistory';
import type { WhatsappMessage } from '@/types';

const LIMIT = 20;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

const directionLabel: Record<WhatsappMessage['direction'], string> = {
  inbound: 'Recebida',
  outbound: 'Enviada',
};

const directionClass: Record<WhatsappMessage['direction'], string> = {
  inbound: 'bg-blue-100 text-blue-700',
  outbound: 'bg-green-100 text-green-700',
};

const WhatsappTab: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data: status, isLoading: loadingStatus } = useWhatsappStatus();
  const { data: messages, isLoading: loadingHistory } = useWhatsappHistory({ page, limit: LIMIT });

  const hasMore = (messages?.length ?? 0) === LIMIT;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Status card */}
      <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
        <MessageSquare size={20} className="text-gray-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">Status da integração</p>
          {loadingStatus ? (
            <p className="text-sm text-gray-400">Verificando...</p>
          ) : status?.configured ? (
            <div className="flex items-center gap-1.5 text-green-700 text-sm">
              <CheckCircle size={14} />
              <span>Configurada — variáveis de ambiente detectadas</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-700 text-sm">
              <XCircle size={14} />
              <span>Não configurada — adicione as variáveis no servidor</span>
            </div>
          )}
        </div>
      </div>

      {/* Setup instructions */}
      {!status?.configured && !loadingStatus && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-800">Como configurar</p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-amber-700">
            <li>
              Acesse{' '}
              <a
                href="https://developers.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-0.5"
              >
                developers.facebook.com <ExternalLink size={11} />
              </a>{' '}
              e crie um App do tipo <strong>Business</strong>.
            </li>
            <li>Adicione o produto <strong>WhatsApp</strong> ao App e gere um número de teste.</li>
            <li>
              Configure o Webhook para o endpoint{' '}
              <code className="bg-amber-100 px-1 rounded text-xs">POST /api/whatsapp/webhook</code>{' '}
              com o campo <code className="bg-amber-100 px-1 rounded text-xs">messages</code>.
            </li>
            <li>
              Adicione as variáveis de ambiente no servidor:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 font-mono text-xs">
                <li>WHATSAPP_ACCESS_TOKEN</li>
                <li>WHATSAPP_PHONE_NUMBER_ID</li>
                <li>WHATSAPP_WEBHOOK_VERIFY_TOKEN</li>
                <li>WHATSAPP_APP_SECRET</li>
              </ul>
            </li>
            <li>Reinicie o servidor e recarregue esta página.</li>
          </ol>
        </div>
      )}

      {/* History table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Histórico de mensagens</h3>

        {loadingHistory ? (
          <p className="text-sm text-gray-400">Carregando...</p>
        ) : !messages?.length ? (
          <p className="text-sm text-gray-400">Nenhuma mensagem registrada.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">Paciente</th>
                  <th className="px-4 py-3 font-medium">Direção</th>
                  <th className="px-4 py-3 font-medium">Mensagem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(msg.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{msg.phone}</td>
                    <td className="px-4 py-3 text-gray-700">{msg.patient?.fullName ?? <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${directionClass[msg.direction]}`}>
                        {directionLabel[msg.direction]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{msg.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {(page > 1 || hasMore) && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-500">Página {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsappTab;
