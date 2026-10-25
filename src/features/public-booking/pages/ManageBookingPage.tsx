import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { PublicApiError } from '@/lib/publicApi';
import { DateStrip } from '../components/DateStrip';
import { PublicLayout } from '../components/PublicLayout';
import { TimeSlotGrid } from '../components/TimeSlotGrid';
import { PUBLIC_MAX_ADVANCE_DAYS, PUBLIC_WINDOW_DAYS, addIsoDays, formatLongDate, todaySP } from '../lib/dates';
import { publicBookingService, type ManagedBooking } from '../services/publicBooking.service';

const STATUS_TEXT: Record<string, string> = {
  pending: 'Aguardando confirmação do salão',
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  in_progress: 'Em atendimento',
  completed: 'Atendimento concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
};

const formatDateTime = (value: string) => {
  const [date, time] = value.split('T');
  return date ? `${formatLongDate(date)} às ${time ?? ''}` : value;
};

const errorMessage = (err: unknown) =>
  err instanceof PublicApiError ? err.message : 'Não foi possível concluir. Tente novamente.';

const secondaryButton =
  'min-h-11 w-full rounded-lg border border-primary-200 bg-white px-4 text-base font-medium text-primary-700 disabled:opacity-60';
const primaryButton =
  'min-h-11 w-full rounded-lg bg-primary-500 px-4 text-base font-medium text-white disabled:opacity-60';

/** Página do link individual: a cliente vê, cancela ou remarca o próprio horário. */
const ManageBookingPage: React.FC = () => {
  const { slug = '', token = '' } = useParams();
  const queryClient = useQueryClient();
  const today = useMemo(() => todaySP(), []);
  const [mode, setMode] = useState<'view' | 'reschedule'>('view');
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [anyProfessional, setAnyProfessional] = useState(false);
  const [windows, setWindows] = useState(1);
  const [date, setDate] = useState<string | null>(null);

  const managedKey = ['public-manage', slug, token];
  const info = useQuery({
    queryKey: ['public-booking', slug, 'info'],
    queryFn: () => publicBookingService.info(slug),
    enabled: slug.length > 0,
    retry: false,
  });
  const managed = useQuery({
    queryKey: managedKey,
    queryFn: () => publicBookingService.manage(slug, token),
    enabled: slug.length > 0 && token.length > 0,
    retry: false,
  });
  const booking = managed.data;
  const professionalId = anyProfessional ? undefined : booking?.professionalId;

  const slotQueries = useQueries({
    queries: Array.from({ length: windows }, (_, index) => {
      const from = addIsoDays(today, index * PUBLIC_WINDOW_DAYS);
      const to = addIsoDays(from, PUBLIC_WINDOW_DAYS - 1);
      return {
        queryKey: ['public-manage', slug, token, 'availability', professionalId ?? '', from, to],
        queryFn: () => publicBookingService.manageAvailability(slug, token, {
          ...(professionalId ? { professionalId } : {}),
          from,
          to,
        }),
        enabled: mode === 'reschedule' && Boolean(booking?.canChange),
        retry: false,
      };
    }),
  });

  const businessName = info.data?.businessName ?? 'Nálu Nails';

  if (managed.isLoading) {
    return (
      <PublicLayout businessName={businessName}>
        <p className="text-sm text-gray-600" aria-busy="true">Abrindo seu horário…</p>
      </PublicLayout>
    );
  }

  if (!booking) {
    const invalid = managed.error instanceof PublicApiError && [400, 404].includes(managed.error.status);
    return (
      <PublicLayout businessName={businessName}>
        <h2 className="font-display text-3xl text-primary-700">{invalid ? 'Link inválido' : 'Não foi possível abrir'}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {invalid
            ? 'Confira o link que você recebeu ou fale com o salão.'
            : errorMessage(managed.error)}
        </p>
      </PublicLayout>
    );
  }

  const updated = (next: ManagedBooking, message: string) => {
    queryClient.setQueryData(managedKey, next);
    setNotice(message);
  };

  const cancel = async () => {
    if (!window.confirm('Cancelar este horário? Essa ação não pode ser desfeita pelo link.')) return;
    setPending(true);
    setNotice(null);
    try {
      await publicBookingService.cancel(slug, token);
      updated({ ...booking, status: 'cancelled', canChange: false }, 'Seu horário foi cancelado.');
    } catch (err) {
      setNotice(errorMessage(err));
      await managed.refetch();
    } finally {
      setPending(false);
    }
  };

  const reschedule = async (time: string) => {
    if (!date) return;
    setPending(true);
    setNotice(null);
    try {
      const next = await publicBookingService.reschedule(slug, token, {
        start: `${date}T${time}`,
        professionalId: professionalId ?? null,
      });
      setMode('view');
      setDate(null);
      updated(next, 'Horário remarcado. Este mesmo link continua valendo.');
    } catch (err) {
      setNotice(errorMessage(err));
      if (err instanceof PublicApiError && err.status === 409) {
        await queryClient.invalidateQueries({ queryKey: ['public-manage', slug, token, 'availability'] });
      } else {
        setMode('view');
        await managed.refetch();
      }
    } finally {
      setPending(false);
    }
  };

  const openDays = [...new Set(slotQueries.flatMap((q) => q.data?.days.map((d) => d.date) ?? []))].sort();
  const slots = slotQueries.flatMap((q) => q.data?.days ?? []).find((d) => d.date === date)?.slots ?? [];
  const [startDate, startTime] = booking.start.split('T');
  const endTime = booking.end.split('T')[1] ?? '';
  const open = ['pending', 'scheduled', 'confirmed'].includes(booking.status);
  const phone = info.data?.phoneDisplay;

  return (
    <PublicLayout businessName={businessName} address={info.data?.address}>
      {notice ? (
        <p role="alert" className="mb-4 rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm text-primary-800">
          {notice}
        </p>
      ) : null}

      {mode === 'view' ? (
        <>
          <div className="rounded-lg border border-primary-200 bg-white px-4 py-4">
            <h2 className="font-display text-2xl text-primary-700">Seu horário</h2>
            <dl className="mt-4 space-y-2 text-base text-gray-800">
              <div>
                <dt className="text-sm text-gray-500">Serviço</dt>
                <dd>{booking.serviceName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Profissional</dt>
                <dd>{booking.professionalFirstName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Data</dt>
                <dd>{startDate ? formatLongDate(startDate) : booking.start}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Horário</dt>
                <dd>{startTime}{endTime ? ` – ${endTime}` : ''}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Situação</dt>
                <dd>{STATUS_TEXT[booking.status] ?? booking.status}</dd>
              </div>
            </dl>
          </div>

          {booking.canChange ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-700">
                Você pode cancelar ou remarcar até {formatDateTime(booking.changeDeadline)}.
              </p>
              <button type="button" className={primaryButton} disabled={pending} onClick={() => setMode('reschedule')}>
                Remarcar
              </button>
              <button type="button" className={secondaryButton} disabled={pending} onClick={() => void cancel()}>
                {pending ? 'Cancelando…' : 'Cancelar horário'}
              </button>
            </div>
          ) : null}

          {!booking.canChange && open ? (
            <p className="mt-4 text-sm text-gray-700">
              O prazo para alterar pelo link terminou ({formatDateTime(booking.changeDeadline)}).{' '}
              {phone ? `Fale com o salão: ${phone}.` : 'Fale com o salão.'}
            </p>
          ) : null}

          {booking.status === 'cancelled' ? (
            <Link
              to={`/agendar/${encodeURIComponent(slug)}`}
              className="mt-4 flex min-h-11 items-center justify-center rounded-lg bg-primary-500 px-4 text-base font-medium text-white"
            >
              Agendar novo horário
            </Link>
          ) : null}
        </>
      ) : (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => { setMode('view'); setDate(null); }}
            className="min-h-11 text-base font-medium text-primary-700"
          >
            Voltar
          </button>
          <div>
            <h2 className="font-display text-2xl text-primary-700">Profissional</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={!anyProfessional}
                onClick={() => { setAnyProfessional(false); setDate(null); }}
                className={!anyProfessional ? primaryButton : secondaryButton}
              >
                Com {booking.professionalFirstName}
              </button>
              <button
                type="button"
                aria-pressed={anyProfessional}
                onClick={() => { setAnyProfessional(true); setDate(null); }}
                className={anyProfessional ? primaryButton : secondaryButton}
              >
                Sem preferência
              </button>
            </div>
          </div>
          <DateStrip
            days={openDays}
            loading={slotQueries.some((q) => q.isLoading)}
            canMore={windows * PUBLIC_WINDOW_DAYS < PUBLIC_MAX_ADVANCE_DAYS}
            onSelect={setDate}
            onMore={() => setWindows((count) => count + 1)}
          />
          {date ? <TimeSlotGrid slots={slots} disabled={pending} onSelect={(time) => void reschedule(time)} /> : null}
        </div>
      )}
    </PublicLayout>
  );
};

export default ManageBookingPage;
