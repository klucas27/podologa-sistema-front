import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { VirtualizedList } from '@/components/ui/VirtualizedList';
import Button from '@/components/ui/Button';
import { usePacientesPage } from '../hooks/usePacientesPage';
import PatientListItem from '../components/PatientListItem';
import type { Patient } from '@/types';

const PATIENT_ROW_HEIGHT = 72; // Altura estimada de cada PatientListItem
const VIRTUALIZE_THRESHOLD = 50; // Virtualiza apenas com 50+ pacientes

const PacientesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    patients, search, isLoading, deletingId,
    handleSearchChange, handleDelete, handleForceDelete,
  } = usePacientesPage();

  const renderPatient = useCallback((patient: Patient) => (
    <PatientListItem
      key={patient.id}
      patient={patient}
      deletingId={deletingId}
      onDelete={handleDelete}
      onForceDelete={handleForceDelete}
    />
  ), [deletingId, handleDelete, handleForceDelete]);

  return (
    <ErrorBoundary featureName="Pacientes">
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pacientes</h1>
          <p className="text-sm text-gray-500">{patients.length} paciente{patients.length !== 1 ? 's' : ''} cadastrado{patients.length !== 1 ? 's' : ''}</p>
        </div>
        <Button icon={<UserPlus size={16} />} onClick={() => navigate('/pacientes/novo')}>Novo Paciente</Button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Pesquisar por nome ou telefone..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4"><SkeletonTable rows={6} cols={3} /></div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center"><p className="text-gray-400 text-sm">{search ? 'Nenhum paciente encontrado para a pesquisa.' : 'Nenhum paciente cadastrado.'}</p></div>
        ) : patients.length >= VIRTUALIZE_THRESHOLD ? (
          <VirtualizedList
            items={patients}
            estimateSize={PATIENT_ROW_HEIGHT}
            renderItem={renderPatient}
            className="max-h-[calc(100vh-280px)]"
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {patients.map((patient) => (
              <PatientListItem
                key={patient.id}
                patient={patient}
                deletingId={deletingId}
                onDelete={handleDelete}
                onForceDelete={handleForceDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default PacientesPage;
