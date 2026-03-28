import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { settingsService } from '../services/settings.service';

const WorkingHoursTab: React.FC = () => {
  const { user } = useAuth();
  const [workdayStart, setWorkdayStart] = useState(user?.workdayStart ?? '08:00');
  const [workdayEnd, setWorkdayEnd] = useState(user?.workdayEnd ?? '18:00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!workdayStart || !workdayEnd) {
      setError('Preencha os horários de início e fim.');
      return;
    }
    if (workdayStart >= workdayEnd) {
      setError('O horário de início deve ser anterior ao de término.');
      return;
    }

    setIsLoading(true);
    try {
      await settingsService.updateWorkingHours({ workdayStart, workdayEnd });
      setSuccess('Horário de trabalho atualizado. Recarregue a página para aplicar no calendário.');
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Erro ao atualizar horários.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && (
        <div className="flex items-center gap-2 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle size={16} className="flex-shrink-0" />{success}
        </div>
      )}

      <p className="text-sm text-gray-500">
        Defina o horário de expediente. O calendário de agendamentos exibirá apenas os horários dentro deste intervalo.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Início do expediente</label>
          <input type="time" value={workdayStart} onChange={(e) => setWorkdayStart(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fim do expediente</label>
          <input type="time" value={workdayEnd} onChange={(e) => setWorkdayEnd(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition" />
        </div>
      </div>

      <Button type="submit" isLoading={isLoading}>Salvar Horários</Button>
    </form>
  );
};

export default WorkingHoursTab;
