import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import type { Patient } from '@/types';
import { formatPhone } from '../hooks/useNovaConsultaPage';

interface Props {
  patientId: string;
  selectedPatientName: string;
  query: string;
  setQuery: (q: string) => void;
  showResults: boolean;
  setShowResults: (v: boolean) => void;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  patients: Patient[];
  isLoadingPatients: boolean;
  selectPatient: (p: Patient) => void;
  clearPatient: () => void;
}

export const PatientAutocomplete: React.FC<Props> = ({
  patientId, selectedPatientName, query, setQuery,
  showResults, setShowResults, wrapperRef,
  patients, isLoadingPatients, selectPatient, clearPatient,
}) => (
  <div>
    <label htmlFor="patient-search" className="block text-sm font-medium text-gray-700 mb-1">
      Paciente <span className="text-danger-500">*</span>
    </label>

    {patientId && selectedPatientName ? (
      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-primary-200 bg-primary-50 text-sm">
        <span className="font-medium text-primary-800">{selectedPatientName}</span>
        <button type="button" onClick={clearPatient} className="p-0.5 rounded text-gray-400 hover:text-gray-600 transition" aria-label="Remover paciente selecionado">
          <X size={16} />
        </button>
      </div>
    ) : (
      <div ref={wrapperRef} className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          id="patient-search"
          type="text"
          role="combobox"
          aria-expanded={showResults}
          aria-autocomplete="list"
          aria-label="Buscar paciente por nome ou telefone"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          placeholder="Buscar por nome ou telefone..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
        />

        {showResults && (
          <div role="listbox" className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {isLoadingPatients ? (
              <div className="flex items-center justify-center p-3">
                <Loader2 size={16} className="animate-spin text-gray-400" />
              </div>
            ) : patients.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">Nenhum paciente encontrado.</div>
            ) : (
              patients.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={patientId === p.id}
                  onClick={() => selectPatient(p)}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-xs flex-shrink-0">
                    {p.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{p.fullName}</div>
                    <div className="text-xs text-gray-500 truncate">{p.phoneNumber ? formatPhone(p.phoneNumber) : 'Sem telefone'}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    )}
  </div>
);
