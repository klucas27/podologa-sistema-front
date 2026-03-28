import React, { useState } from 'react';
import { Lock, Clock } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import SecurityTab from '../components/SecurityTab';
import WorkingHoursTab from '../components/WorkingHoursTab';

type TabKey = 'security' | 'workingHours';

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { key: 'security', label: 'Segurança', icon: <Lock size={16} /> },
  { key: 'workingHours', label: 'Horário de Trabalho', icon: <Clock size={16} /> },
];

const ConfiguracoesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('security');

  return (
    <ErrorBoundary featureName="Configurações">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
        <p className="text-sm text-gray-500">Personalize o sistema.</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'workingHours' && <WorkingHoursTab />}
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default ConfiguracoesPage;
