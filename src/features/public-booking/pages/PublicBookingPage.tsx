import React, { useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { PublicApiError } from '@/lib/publicApi';
import { ConfirmationCard } from '../components/ConfirmationCard';
import { DateStrip } from '../components/DateStrip';
import { GreetingHeader } from '../components/GreetingHeader';
import { PhoneStep } from '../components/PhoneStep';
import { ProfessionalStep } from '../components/ProfessionalStep';
import { PublicLayout, PublicPrimaryButton } from '../components/PublicLayout';
import { QuickRegisterStep } from '../components/QuickRegisterStep';
import { ServiceStep } from '../components/ServiceStep';
import { TimeSlotGrid } from '../components/TimeSlotGrid';
import { usePublicBooking } from '../hooks/usePublicBooking';
import { PUBLIC_MAX_ADVANCE_DAYS, PUBLIC_WINDOW_DAYS, addIsoDays, todaySP } from '../lib/dates';
import { publicBookingService } from '../services/publicBooking.service';

const PHONE_FORM = 'public-phone-form';
const REGISTER_FORM = 'public-register-form';

const PublicBookingPage: React.FC = () => {
  const { slug = '' } = useParams();
  const [windows, setWindows] = useState(1);
  const today = useMemo(() => todaySP(), []);
  const info = useQuery({
    queryKey: ['public-booking', slug, 'info'],
    queryFn: () => publicBookingService.info(slug),
    enabled: slug.length > 0,
    retry: false,
  });
  const booking = usePublicBooking(slug);
  const { step, notice, firstName, serviceId, professionalId, professionalChosen, date, confirmation } = booking.state;
  const wantsSlots = step === 'date' || step === 'time';

  const slotQueries = useQueries({
    queries: Array.from({ length: windows }, (_, index) => {
      const from = addIsoDays(today, index * PUBLIC_WINDOW_DAYS);
      const to = addIsoDays(from, PUBLIC_WINDOW_DAYS - 1);
      return {
        queryKey: ['public-booking', slug, 'availability', serviceId, professionalId ?? '', from, to],
        queryFn: () => publicBookingService.availability(slug, {
          serviceId: serviceId ?? '',
          ...(professionalId ? { professionalId } : {}),
          from,
          to,
        }),
        enabled: wantsSlots && Boolean(serviceId) && professionalChosen,
      };
    }),
  });

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

  const salon = info.data;
  const openDays = [...new Set(slotQueries.flatMap((query) => query.data?.days.map((day) => day.date) ?? []))].sort();
  const slots = slotQueries.flatMap((query) => query.data?.days ?? []).find((day) => day.date === date)?.slots ?? [];
  const professionals = salon.professionals.filter((professional) =>
    serviceId ? professional.serviceIds.includes(serviceId) : false,
  );

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
      {step !== 'phone' && step !== 'confirmation' ? (
        <button
          type="button"
          onClick={() => booking.dispatch({ type: 'BACK' })}
          className="mb-3 min-h-11 text-base font-medium text-primary-700"
        >
          Voltar
        </button>
      ) : null}
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

      {step === 'service' ? (
        <ServiceStep
          services={salon.services}
          onSelect={(id) => booking.dispatch({ type: 'SELECT_SERVICE', serviceId: id })}
        />
      ) : null}

      {step === 'professional' ? (
        <ProfessionalStep
          professionals={professionals}
          onSelect={(id) => booking.dispatch({ type: 'SELECT_PROFESSIONAL', professionalId: id })}
        />
      ) : null}

      {step === 'date' ? (
        <DateStrip
          days={openDays}
          loading={slotQueries.some((query) => query.isLoading)}
          canMore={windows * PUBLIC_WINDOW_DAYS < PUBLIC_MAX_ADVANCE_DAYS}
          onSelect={(day) => booking.dispatch({ type: 'SELECT_DATE', date: day })}
          onMore={() => setWindows((count) => count + 1)}
        />
      ) : null}

      {step === 'time' ? (
        <TimeSlotGrid
          slots={slots}
          disabled={booking.pending}
          onSelect={(time) => {
            if (!serviceId || !date) return;
            void booking.book({ serviceId, professionalId, start: `${date}T${time}` });
          }}
        />
      ) : null}

      {step === 'confirmation' && confirmation ? <ConfirmationCard booking={confirmation} /> : null}
    </PublicLayout>
  );
};

export default PublicBookingPage;
