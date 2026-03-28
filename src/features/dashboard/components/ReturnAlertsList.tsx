import React from 'react';
import { AlertTriangle, Clock, User } from 'lucide-react';
import type { ReturnAlertItem } from '@/types';

interface ReturnAlertsListProps {
  alerts: ReturnAlertItem[];
}

const ReturnAlertsList: React.FC<ReturnAlertsListProps> = ({ alerts }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Alertas de Retorno</h2>
        <span className="badge badge-danger">{alerts.length}</span>
      </div>

      {alerts.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-gray-400">Nenhum alerta de retorno pendente</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                  alert.urgent
                    ? 'bg-danger-50 text-danger-600'
                    : 'bg-warning-50 text-warning-600'
                }`}
              >
                {alert.urgent ? <AlertTriangle size={18} /> : <User size={18} />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {alert.patient}
                </p>
                <p className="text-xs text-gray-400">
                  Retorno previsto: {new Date(alert.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Clock size={13} className="text-gray-400" />
                <span
                  className={`text-xs font-medium ${
                    alert.urgent ? 'text-danger-500' : 'text-warning-500'
                  }`}
                >
                  {alert.daysOverdue}d atraso
                </span>
              </div>

              {alert.urgent && (
                <span className="badge badge-danger flex-shrink-0">Urgente</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReturnAlertsList;
