import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ApiError } from '@/lib/api';
import type { BusinessSettings } from '@/types';
import { settingsService } from '../services/settings.service';

const SLUG_RE = /^[a-z0-9-]{3,60}$/;
const SLUG_ERROR = 'Use letras minúsculas, números e hífen (3 a 60).';
const STEPS = [5, 10, 15, 20, 30] as const;

const fieldClass =
  'w-full min-h-11 px-3 py-2.5 rounded-lg border border-gray-300 text-base focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition';

interface FormState {
  businessName: string;
  slug: string;
  address: string;
  phoneDisplay: string;
  onlineBookingEnabled: boolean;
  autoConfirmOnlineBooking: boolean;
  minAdvanceHours: string;
  maxAdvanceDays: string;
  slotStepMinutes: (typeof STEPS)[number];
  minCancelHours: string;
  maxPendingPerPhone: string;
  consentText: string;
  consentVersion: string;
}

function minutesToHours(minutes: number): string {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? String(hours) : String(Math.round(hours * 100) / 100);
}

function asStep(value: number): (typeof STEPS)[number] {
  return STEPS.find((step) => step === value) ?? 15;
}

function toForm(data: BusinessSettings): FormState {
  return {
    businessName: data.businessName,
    slug: data.slug,
    address: data.address ?? '',
    phoneDisplay: data.phoneDisplay ?? '',
    onlineBookingEnabled: Boolean(data.onlineBookingEnabled),
    autoConfirmOnlineBooking: Boolean(data.autoConfirmOnlineBooking),
    minAdvanceHours: minutesToHours(data.minAdvanceMinutes),
    maxAdvanceDays: String(data.maxAdvanceDays),
    slotStepMinutes: asStep(data.slotStepMinutes),
    minCancelHours: String(data.minCancelHours),
    maxPendingPerPhone: String(data.maxPendingPerPhone),
    consentText: data.consentText,
    consentVersion: data.consentVersion,
  };
}

function bookingLink(slug: string): string {
  return `${window.location.origin}/agendar/${slug}`;
}

function parseIntInRange(value: string, min: number, max: number): number | null {
  if (!/^\d+$/.test(value)) return null;
  const n = Number(value);
  if (n < min || n > max) return null;
  return n;
}

const BookingLinkTab: React.FC = () => {
  const linkRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [success, setSuccess] = useState('');
  const [copyNotice, setCopyNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    settingsService
      .getBusiness()
      .then((data) => {
        if (!cancelled) setForm(toForm(data));
      })
      .catch(() => {
        if (!cancelled) setLoadError('Não foi possível carregar as configurações.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const slug = form?.slug ?? '';

  useEffect(() => {
    if (!SLUG_RE.test(slug)) {
      setQrUrl('');
      return;
    }
    const link = bookingLink(slug);
    let cancelled = false;
    void import('qrcode')
      .then((QR) => QR.toDataURL(link, { margin: 1, width: 512 }))
      .then((url) => {
        if (!cancelled) setQrUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const patch = (partial: Partial<FormState>) => {
    setForm((current) => (current ? { ...current, ...partial } : current));
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setError('');
    setSuccess('');
    setSlugError('');

    if (!SLUG_RE.test(form.slug)) {
      setSlugError(SLUG_ERROR);
      return;
    }
    if (!form.businessName.trim()) {
      setError('Informe o nome do salão.');
      return;
    }
    const hours = Number(form.minAdvanceHours);
    if (!Number.isFinite(hours) || hours < 0 || hours > 168) {
      setError('A antecedência mínima deve ficar entre 0 e 168 horas.');
      return;
    }
    const maxAdvanceDays = parseIntInRange(form.maxAdvanceDays, 1, 120);
    const minCancelHours = parseIntInRange(form.minCancelHours, 0, 168);
    const maxPendingPerPhone = parseIntInRange(form.maxPendingPerPhone, 1, 5);
    if (maxAdvanceDays === null || minCancelHours === null || maxPendingPerPhone === null) {
      setError('Revise os prazos e o máximo de pedidos pendentes.');
      return;
    }
    if (form.consentText.trim().length < 20 || !form.consentVersion.trim()) {
      setError('O texto do consentimento precisa de pelo menos 20 caracteres e uma versão.');
      return;
    }

    const payload: BusinessSettings = {
      businessName: form.businessName.trim(),
      slug: form.slug,
      address: form.address.trim() ? form.address.trim() : null,
      phoneDisplay: form.phoneDisplay.trim() ? form.phoneDisplay.trim() : null,
      onlineBookingEnabled: form.onlineBookingEnabled,
      autoConfirmOnlineBooking: form.autoConfirmOnlineBooking,
      minAdvanceMinutes: Math.round(hours * 60),
      maxAdvanceDays,
      slotStepMinutes: form.slotStepMinutes,
      minCancelHours,
      maxPendingPerPhone,
      consentText: form.consentText.trim(),
      consentVersion: form.consentVersion.trim(),
    };

    setSaving(true);
    try {
      const saved = await settingsService.updateBusiness(payload);
      setForm(toForm(saved));
      setSuccess('Configurações salvas.');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Este endereço já está em uso');
      } else {
        setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
      }
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    const link = bookingLink(slug);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('sem clipboard');
      await navigator.clipboard.writeText(link);
      setCopyNotice('Link copiado.');
    } catch {
      linkRef.current?.focus();
      linkRef.current?.select();
      setCopyNotice('Copie manualmente');
    }
  };

  if (loadError) {
    return (
      <div className="flex items-center gap-2 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
        <AlertCircle size={16} className="flex-shrink-0" />
        {loadError}
      </div>
    );
  }

  if (!form) {
    return <p className="text-sm text-gray-500">Carregando configurações…</p>;
  }

  const link = bookingLink(form.slug);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .booking-link-print, .booking-link-print * { visibility: visible !important; }
          .booking-link-print { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

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
        <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-1">Nome do salão</label>
        <input id="business-name" value={form.businessName} onChange={(e) => patch({ businessName: e.target.value })} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="booking-slug" className="block text-sm font-medium text-gray-700 mb-1">Endereço do link</label>
        <input
          id="booking-slug"
          value={form.slug}
          onChange={(e) => {
            patch({ slug: e.target.value });
            setSlugError('');
          }}
          className={fieldClass}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        {slugError && <p className="mt-1 text-sm text-danger-700">{slugError}</p>}
      </div>
      <div>
        <label htmlFor="business-address" className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
        <input id="business-address" value={form.address} onChange={(e) => patch({ address: e.target.value })} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="phone-display" className="block text-sm font-medium text-gray-700 mb-1">Telefone exibido</label>
        <input id="phone-display" value={form.phoneDisplay} onChange={(e) => patch({ phoneDisplay: e.target.value })} className={fieldClass} />
      </div>

      <label className="flex items-center gap-2 min-h-11 text-sm text-gray-700">
        <input type="checkbox" checked={form.onlineBookingEnabled} onChange={(e) => patch({ onlineBookingEnabled: e.target.checked })} />
        Ativar link
      </label>
      <label className="flex items-center gap-2 min-h-11 text-sm text-gray-700">
        <input type="checkbox" checked={form.autoConfirmOnlineBooking} onChange={(e) => patch({ autoConfirmOnlineBooking: e.target.checked })} />
        Auto-confirmar
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="min-advance" className="block text-sm font-medium text-gray-700 mb-1">Antecedência mínima (horas)</label>
          <input id="min-advance" type="number" min={0} max={168} step={1} value={form.minAdvanceHours} onChange={(e) => patch({ minAdvanceHours: e.target.value })} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="max-advance" className="block text-sm font-medium text-gray-700 mb-1">Antecedência máxima (dias)</label>
          <input id="max-advance" type="number" min={1} max={120} step={1} value={form.maxAdvanceDays} onChange={(e) => patch({ maxAdvanceDays: e.target.value })} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="slot-step" className="block text-sm font-medium text-gray-700 mb-1">Passo (minutos)</label>
          <select id="slot-step" value={form.slotStepMinutes} onChange={(e) => patch({ slotStepMinutes: asStep(Number(e.target.value)) })} className={fieldClass}>
            {STEPS.map((step) => (
              <option key={step} value={step}>{step}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cancel-hours" className="block text-sm font-medium text-gray-700 mb-1">Prazo de cancelamento (horas)</label>
          <input id="cancel-hours" type="number" min={0} max={168} step={1} value={form.minCancelHours} onChange={(e) => patch({ minCancelHours: e.target.value })} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="max-pending" className="block text-sm font-medium text-gray-700 mb-1">Máx. pedidos pendentes</label>
          <input id="max-pending" type="number" min={1} max={5} step={1} value={form.maxPendingPerPhone} onChange={(e) => patch({ maxPendingPerPhone: e.target.value })} className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="consent-text" className="block text-sm font-medium text-gray-700 mb-1">Texto do consentimento</label>
        <textarea id="consent-text" rows={4} value={form.consentText} onChange={(e) => patch({ consentText: e.target.value })} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="consent-version" className="block text-sm font-medium text-gray-700 mb-1">Versão do consentimento</label>
        <input id="consent-version" value={form.consentVersion} onChange={(e) => patch({ consentVersion: e.target.value })} className={fieldClass} />
      </div>

      <button type="submit" disabled={saving} className="min-h-11 px-4 rounded-lg bg-primary-500 text-white text-sm font-medium disabled:opacity-60">
        {saving ? 'Salvando…' : 'Salvar'}
      </button>

      <div className="border-t border-gray-200 pt-6 space-y-4">
        <div>
          <label htmlFor="booking-link" className="block text-sm font-medium text-gray-700 mb-1">Link completo</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input id="booking-link" ref={linkRef} readOnly value={link} className={fieldClass} />
            <button type="button" onClick={() => void copyLink()} className="min-h-11 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Copiar
            </button>
          </div>
          {copyNotice && <p role="status" className="mt-1 text-sm text-gray-600">{copyNotice}</p>}
        </div>

        <div className="booking-link-print space-y-3">
          <p className="font-display text-xl text-gray-800">{form.businessName || 'Link de agendamento'}</p>
          {qrUrl && (
            <img src={qrUrl} alt={`QR code de ${form.businessName || 'agendamento'}`} width={256} height={256} />
          )}
        </div>
        <button type="button" onClick={() => window.print()} className="min-h-11 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700">
          Imprimir QR
        </button>
      </div>
    </form>
  );
};

export default BookingLinkTab;
