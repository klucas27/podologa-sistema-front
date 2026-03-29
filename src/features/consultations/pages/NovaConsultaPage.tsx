import React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useNovaConsultaPage } from '../hooks/useNovaConsultaPage';
import { PatientAutocomplete } from '../components/PatientAutocomplete';

const INPUT_CLASS = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition';

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
          <h1 className="text-2xl font-bold text-gray-800">Novo Agendamento</h1>
          <p className="text-sm text-gray-500">Agende uma nova consulta para o paciente.</p>
        </div>
      </div>

      <form onSubmit={h.handleSubmit} className="space-y-6">
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
              Profissional Responsável <span className="text-danger-500">*</span>
            </label>
            {h.isLoadingProfessionals ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" /> Carregando profissionais...
              </div>
            ) : (
              <select id="professional-select" value={h.professionalId} onChange={(e) => h.setProfessionalId(e.target.value)} disabled={h.isProfessionalUser} className={`${INPUT_CLASS} bg-white ${h.isProfessionalUser ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <option value="">Selecione um profissional...</option>
                {h.professionals.map((prof) => (
                  <option key={prof.id} value={prof.id}>{prof.fullName}{prof.specialty ? ` — ${prof.specialty}` : ''}</option>
                ))}
              </select>
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
              <label htmlFor="scheduled-end" className="block text-sm font-medium text-gray-700 mb-1">Término <span className="text-danger-500">*</span></label>
              <input id="scheduled-end" type="time" value={h.scheduledEnd} onChange={(e) => h.setScheduledEnd(e.target.value)} className={INPUT_CLASS} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="appointment-notes" className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea id="appointment-notes" value={h.notes} onChange={(e) => h.setNotes(e.target.value)} rows={2} className={`${INPUT_CLASS} resize-none`} placeholder="Observações do agendamento..." />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={h.goBack}>Cancelar</Button>
          <Button type="submit" isLoading={h.isSaving}>Agendar Consulta</Button>
        </div>
      </form>
    </div>
    </ErrorBoundary>
  );
};

export default NovaConsultaPage;
