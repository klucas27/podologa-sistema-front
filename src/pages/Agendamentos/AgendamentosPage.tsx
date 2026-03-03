import React from 'react';

const AgendamentosPage: React.FC = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold text-gray-800">Agendamentos</h1>
    <p className="text-sm text-gray-500">Controle a agenda do consultório.</p>
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <p className="text-gray-400 text-sm">Calendário de agendamentos em breve</p>
    </div>
  </div>
);

export default AgendamentosPage;
