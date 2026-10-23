import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { PublicApiError } from '@/lib/publicApi';
import { GreetingHeader } from '../components/GreetingHeader';
import { PhoneStep } from '../components/PhoneStep';
import { PublicLayout, PublicPrimaryButton } from '../components/PublicLayout';
import { QuickRegisterStep } from '../components/QuickRegisterStep';
import { usePublicBooking } from '../hooks/usePublicBooking';
import { publicBookingService } from '../services/publicBooking.service';

const PHONE_FORM = 'public-phone-form';
const REGISTER_FORM = 'public-register-form';

const PublicBookingPage: React.FC = () => {
  const { slug = '' } = useParams();
  const info = useQuery({
    queryKey: ['public-booking', slug, 'info'],
    queryFn: () => publicBookingService.info(slug),
    enabled: slug.length > 0,
    retry: false,
  });
  const booking = usePublicBooking(slug);

  if (info.isLoading) {
    return (
      <PublicLayout businessName="Nálu Nails">
        <p className="text-sm text-gray-600" aria-busy="true">Abrindo o agendamento…</p>
      </PublicLayout>
    );
  }

  if (info.error instanceof PublicApiError && info.error.status === 404) {
    return (
      <PublicLayout businessName="Nálu Nails">
        <h2 className="font-display text-3xl text-primary-700">Agendamento indisponível</h2>
        <p className="mt-2 text-sm text-gray-600">Este link não está recebendo horários agora.</p>
      </PublicLayout>
    );
  }

  if (!info.data) {
    return (
      <PublicLayout businessName="Nálu Nails">
        <p className="text-sm text-gray-600">Não foi possível abrir o agendamento. Tente de novo em instantes.</p>
      </PublicLayout>
    );
  }

  const { step, notice, firstName } = booking.state;
  const salon = info.data;

  const footer = step === 'phone' ? (
    <PublicPrimaryButton form={PHONE_FORM} disabled={booking.pending}>
      {booking.pending ? 'Buscando…' : 'Continuar'}
    </PublicPrimaryButton>
  ) : step === 'register' ? (
    <PublicPrimaryButton form={REGISTER_FORM} disabled={booking.pending}>
      {booking.pending ? 'Salvando…' : 'Cadastrar'}
    </PublicPrimaryButton>
  ) : step === 'greeting' ? (
    <PublicPrimaryButton type="button" onClick={() => booking.dispatch({ type: 'CONTINUE' })}>
      Continuar
    </PublicPrimaryButton>
  ) : null;

  return (
    <PublicLayout businessName={salon.businessName} address={salon.address} footer={footer}>
      {notice ? (
        <p role="alert" className="mb-4 rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm text-primary-800">
          {notice}
        </p>
      ) : null}

      {step === 'phone' ? (
        <PhoneStep formId={PHONE_FORM} disabled={booking.pending} onSubmit={(phone) => void booking.identify(phone)} />
      ) : null}

      {step === 'register' ? (
        <QuickRegisterStep
          formId={REGISTER_FORM}
          consentText={salon.consentText}
          disabled={booking.pending}
          onSubmit={(values) => void booking.register(values)}
        />
      ) : null}

      {step === 'greeting' && firstName ? <GreetingHeader firstName={firstName} /> : null}

      {step === 'service' || step === 'professional' || step === 'date' || step === 'time' || step === 'confirmation' ? (
        <p className="text-sm text-gray-600">A escolha do serviço e do horário continua nesta página.</p>
      ) : null}
    </PublicLayout>
  );
};

export default PublicBookingPage;
