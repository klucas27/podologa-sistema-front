import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  ChevronRight,
  Phone,
  Loader2,
  ClipboardCheck,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/services/api';
import type { Patient } from '@/types';

const PacientesPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPatients = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      const params = query ? { params: { search: query } } : undefined;
      const res = await api.get<{ data: Patient[] }>('/api/patients', params);
      setPatients(res.data);
    } catch {
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPatients(search || undefined);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, fetchPatients]);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o paciente "${name}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/patients/${id}`);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Erro ao excluir paciente. Verifique se não há registros vinculados.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatCpf = (cpf: string) => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return cpf;
    // Mask middle digits for privacy: 123.***.***-45
    const first = digits.slice(0, 3);
    const last = digits.slice(9);
    return `${first}.***.***-${last}`;
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return '—';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return phone;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pacientes</h1>
          <p className="text-sm text-gray-500">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} cadastrado{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          icon={<UserPlus size={16} />}
          onClick={() => navigate('/pacientes/novo')}
        >
          Novo Paciente
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou telefone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white"
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 size={24} className="animate-spin text-primary-500" />
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm">
              {search ? 'Nenhum paciente encontrado para a pesquisa.' : 'Nenhum paciente cadastrado.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {patients.map((patient) => (
              <li
                key={patient.id}
                className="group flex items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => navigate(`/pacientes/${patient.id}`)}
              >
                {/* Avatar */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex-shrink-0">
                  {patient.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {patient.fullName}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                    <span className="text-xs text-gray-400">
                      CPF: {formatCpf(patient.cpf)}
                    </span>
                    {patient.phoneNumber && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone size={12} />
                        {formatPhone(patient.phoneNumber)}
                      </span>
                    )}
                    {(patient._count?.anamneses ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <ClipboardCheck size={12} />
                        Anamnese
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                        Sem anamnese
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/pacientes/${patient.id}/editar`);
                    }}
                    type="button"
                    className="p-2 rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition"
                    title="Editar paciente"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(patient.id, patient.fullName);
                    }}
                    disabled={deletingId === patient.id}
                    type="button"
                    className="p-2 rounded-lg text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition disabled:opacity-50"
                    title="Excluir paciente"
                  >
                    {deletingId === patient.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                <ChevronRight size={16} className="text-gray-300 flex-shrink-0 hidden sm:block" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PacientesPage;
