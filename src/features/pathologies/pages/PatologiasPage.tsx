import React from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, Bug } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { usePatologiasPage } from '../hooks/usePatologiasPage';
import PathologyModal from '../components/PathologyModal';

const PatologiasPage: React.FC = () => {
  const h = usePatologiasPage();

  return (
    <ErrorBoundary featureName="Patologias">
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patologias</h1>
          <p className="text-sm text-gray-500">{h.pathologies.length} patologia{h.pathologies.length !== 1 ? 's' : ''} cadastrada{h.pathologies.length !== 1 ? 's' : ''}</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={h.openCreate}>Nova Patologia</Button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={h.search} onChange={(e) => h.setSearch(e.target.value)} placeholder="Pesquisar por nome ou descrição..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition bg-white" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {h.isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 size={24} className="animate-spin text-primary-500" /></div>
        ) : h.filtered.length === 0 ? (
          <div className="p-8 text-center"><p className="text-gray-400 text-sm">{h.search ? 'Nenhuma patologia encontrada para a pesquisa.' : 'Nenhuma patologia cadastrada.'}</p></div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {h.filtered.map((p) => (
              <li key={p.id} className="group flex items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex-shrink-0"><Bug size={18} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  {p.description && <p className="text-xs text-gray-400 truncate mt-0.5">{p.description}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => h.openEdit(p)} className="p-2 rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition" title="Editar patologia"><Pencil size={16} /></button>
                  <button onClick={() => h.handleDelete(p.id, p.name)} disabled={h.deletingId === p.id} className="p-2 rounded-lg text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition disabled:opacity-50" title="Excluir patologia">
                    {h.deletingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {h.modalOpen && (
        <PathologyModal
          editingId={h.editingId}
          form={h.form}
          setForm={h.setForm}
          formError={h.formError}
          isSaving={h.isSaving}
          onSave={h.handleSave}
          onClose={h.closeModal}
        />
      )}
    </div>
    </ErrorBoundary>
  );
};

export default PatologiasPage;
