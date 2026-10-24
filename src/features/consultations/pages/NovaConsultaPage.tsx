import React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useNovaConsultaPage, SOURCE_OPTIONS } from '../hooks/useNovaConsultaPage';
import { PatientAutocomplete } from '../components/PatientAutocomplete';
import { SlotPicker } from '../components/SlotPicker';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const INPUT_CLASS = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition';

const NovaConsultaPage: React.FC = () => {
  const h = useNovaConsultaPage();

  if (h.isLoadingPatients && h.patients.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={24} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <ErrorBoundary featureName="Novo Agendamento">
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={h.goBack} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition" aria-label="Voltar">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Novo agendamento</h1>
          <p className="text-sm text-gray-500">Duração e preço vêm do serviço escolhido.</p>
        </div>
      </div>

      <form onSubmit={h.handleSubmit} className="space-y-6">
        {h.isReferral && (
          <div role="status" className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-3 rounded-lg text-sm">
            Agendamento de encaminhamento: só podólogas aparecem e o encaminhamento passa a "Agendado".
          </div>
        )}
        {h.error && <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">{h.error}</div>}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <PatientAutocomplete
            patientId={h.patientId} selectedPatientName={h.selectedPatientName}
            query={h.query} setQuery={h.setQuery} showResults={h.showResults} setShowResults={h.setShowResults}
            wrapperRef={h.wrapperRef} patients={h.patients} isLoadingPatients={h.isLoadingPatients}
            selectPatient={h.selectPatient} clearPatient={h.clearPatient}
          />

          {/* Professional select */}
          <div>
            <label htmlFor="professional-select" className="block text-sm font-medium text-gray-700 mb-1">
              Profissional <span className="text-danger-500">*</span>
            </label>
            {h.isLoadingProfessionals ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" /> Carregando profissionais...
              </div>
            ) : (
              <select id="professional-select" value={h.professionalId} onChange={(e) => h.setProfessionalId(e.target.value)} disabled={h.isProfessionalUser} className={`${INPUT_CLASS} bg-white ${h.isProfessionalUser ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <option value="">Selecione a profissional...</option>
                {h.professionals.map((prof) => (
                  <option key={prof.id} value={prof.id}>{prof.fullName} — {prof.type === 'podologa' ? 'Podóloga' : 'Manicure'}</option>
                ))}
              </select>
            )}
          </div>

          {/* Service select */}
          <div>
            <label htmlFor="service-select" className="block text-sm font-medium text-gray-700 mb-1">
              Serviço <span className="text-danger-500">*</span>
            </label>
            <select id="service-select" value={h.serviceId} onChange={(e) => h.setServiceId(e.target.value)}
              disabled={!h.professionalId || h.isLoadingServices} className={`${INPUT_CLASS} bg-white disabled:bg-gray-50`}>
              <option value="">{h.professionalId ? 'Selecione o serviço...' : 'Escolha a profissional primeiro'}</option>
              {h.activeServices.map((sv) => (
                <option key={sv.id} value={sv.id}>{sv.name} — {sv.durationMinutes} min · {brl(sv.price)}</option>
              ))}
            </select>
            {h.professionalId && !h.isLoadingServices && h.activeServices.length === 0 && (
              <p className="text-xs text-warning-700 mt-1">Esta profissional ainda não tem serviços vinculados (Profissionais → editar).</p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="scheduled-date" className="block text-sm font-medium text-gray-700 mb-1">Data <span className="text-danger-500">*</span></label>
              <input id="scheduled-date" inputMode="numeric" placeholder="DD/MM/AAAA" maxLength={10} value={h.scheduledDate} onChange={h.handleDateChange} className={INPUT_CLASS} />
            </div>
            <div>
              <label htmlFor="scheduled-start" className="block text-sm font-medium text-gray-700 mb-1">Início <span className="text-danger-500">*</span></label>
              <input id="scheduled-start" type="time" value={h.scheduledStart} onChange={(e) => h.setScheduledStart(e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">Término</span>
              <p className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-base text-gray-600" aria-live="polite">
                {h.scheduledEnd || '—'}
              </p>
            </div>
          </div>

          {h.slotsEnabled && (
            <SlotPicker
              slots={h.slots}
              selected={h.scheduledStart}
              isLoading={h.isLoadingSlots}
              onSelect={h.setScheduledStart}
            />
          )}

          <div>
            <label htmlFor="source-select" className="block text-sm font-medium text-gray-700 mb-1">Como a cliente marcou?</label>
            <select id="source-select" value={h.source} onChange={(e) => h.setSource(e.target.value as typeof h.source)} className={`${INPUT_CLASS} bg-white`}>
              {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="appointment-notes" className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea id="appointment-notes" value={h.notes} onChange={(e) => h.setNotes(e.target.value)} rows={2} className={`${INPUT_CLASS} resize-none`} placeholder="Observações do agendamento..." />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={h.goBack}>Cancelar</Button>
          <Button type="submit" isLoading={h.isSaving}>Agendar</Button>
        </div>
      </form>
    </div>
    </ErrorBoundary>
  );
};

export default NovaConsultaPage;
