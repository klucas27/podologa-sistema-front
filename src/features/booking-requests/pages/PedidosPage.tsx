import React from 'react';
import { Loader2 } from 'lucide-react';
import { formatDateTime } from '@/lib/dateUtils';
import { maskPhone } from '@/lib/phone';
import { useServices } from '@/features/services/hooks/useServices';
import type { AppointmentSource } from '@/types';
import { PendingRequestCard } from '../components/PendingRequestCard';
import {
  useBookingRequests,
  useConfirmBookingRequest,
  useDeclineBookingRequest,
} from '../hooks/useBookingRequests';

const SOURCE_LABELS: Record<AppointmentSource, string> = {
  link: 'Link',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  indicacao: 'Indicação',
  balcao: 'Balcão / telefone',
};

function displayPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  return maskPhone(phone) || phone;
}

const PedidosPage: React.FC = () => {
  const requests = useBookingRequests();
  const services = useServices();
  const confirm = useConfirmBookingRequest();
  const decline = useDeclineBookingRequest();
  const serviceNames = new Map((services.data ?? []).map((service) => [service.id, service.name]));
  const busyId = confirm.isPending ? confirm.variables : decline.isPending ? decline.variables : undefined;
  const actionError = confirm.error ?? decline.error;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
        <p className="text-sm text-gray-500">Horários pedidos pelo link que ainda precisam de uma resposta.</p>
      </div>

      {actionError && (
        <div role="alert" className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
          {actionError.message}
        </div>
      )}

      {requests.isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 size={24} className="animate-spin text-primary-500" />
        </div>
      ) : requests.isError ? (
        <p role="alert" className="text-sm text-danger-700">Não foi possível carregar os pedidos.</p>
      ) : (requests.data ?? []).length === 0 ? (
        <p className="text-sm text-gray-600">Nenhum pedido pendente.</p>
      ) : (
        <div className="space-y-3">
          {(requests.data ?? []).map((appointment) => (
            <PendingRequestCard
              key={appointment.id}
              patientName={appointment.patient?.fullName ?? 'Cliente'}
              phone={displayPhone(appointment.patient?.phoneNumber)}
              serviceName={appointment.serviceId ? (serviceNames.get(appointment.serviceId) ?? 'Serviço') : 'Serviço'}
              professionalName={appointment.professional?.fullName ?? '—'}
              when={formatDateTime(appointment.scheduledStart)}
              sourceLabel={SOURCE_LABELS[appointment.source] ?? appointment.source}
              busy={busyId === appointment.id}
              onConfirm={() => confirm.mutate(appointment.id)}
              onDecline={() => decline.mutate(appointment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PedidosPage;
