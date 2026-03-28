import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Loader2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import Button from '@/components/ui/Button';
import { usePacientesPage } from '../hooks/usePacientesPage';
import PatientListItem from '../components/PatientListItem';

const PacientesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    patients, search, isLoading, deletingId,
    handleSearchChange, handleSearchDebounced, handleDelete, handleForceDelete,
  } = usePacientesPage();

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleSearchDebounced(search);
    }, 400);
    return () => clearTimeout(timerRef.current);
  }, [search, handleSearchDebounced]);

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
          <div className="flex items-center justify-center p-12"><Loader2 size={24} className="animate-spin text-primary-500" /></div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center"><p className="text-gray-400 text-sm">{search ? 'Nenhum paciente encontrado para a pesquisa.' : 'Nenhum paciente cadastrado.'}</p></div>
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
