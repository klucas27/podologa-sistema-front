import React from 'react';
import {
  CalendarDays,
  Users,
  DollarSign,
  BellRing,
} from 'lucide-react';
import MetricCard from '@/components/Dashboard/MetricCard';
import UpcomingAppointments from '@/components/Dashboard/UpcomingAppointments';
import PatientFlowChart from '@/components/Dashboard/PatientFlowChart';
import type { AppointmentItem } from '@/components/Dashboard/UpcomingAppointments';
import type { FlowDataPoint } from '@/components/Dashboard/PatientFlowChart';

// ---------- Mock data (substituir por dados reais da API) ----------

const metrics = [
  {
    label: 'Atendimentos Hoje',
    value: 12,
    icon: CalendarDays,
    colorClass: 'bg-primary-50 text-primary-600',
    trend: { value: '+8% vs ontem', positive: true },
  },
  {
    label: 'Novos Pacientes',
    value: 4,
    icon: Users,
    colorClass: 'bg-success-50 text-success-700',
    trend: { value: '+2 esta semana', positive: true },
  },
  {
    label: 'Faturamento Semanal',
    value: 'R$ 3.240',
    icon: DollarSign,
    colorClass: 'bg-warning-50 text-warning-700',
    trend: { value: '+12%', positive: true },
  },
  {
    label: 'Alertas de Retorno',
    value: 7,
    icon: BellRing,
    colorClass: 'bg-danger-50 text-danger-700',
    trend: { value: '3 urgentes', positive: false },
  },
];

const mockAppointments: AppointmentItem[] = [
  { id: '1', patient: 'Ana Paula Mendes', time: '08:30', procedure: 'Avaliação Podológica', status: 'confirmado' },
  { id: '2', patient: 'Carlos Eduardo Lima', time: '09:15', procedure: 'Tratamento Onicocriptose', status: 'agendado' },
  { id: '3', patient: 'Maria José Santos', time: '10:00', procedure: 'Reflexologia Podal', status: 'em_atendimento' },
  { id: '4', patient: 'Roberto Alves', time: '11:00', procedure: 'Curativo Especializado', status: 'agendado' },
  { id: '5', patient: 'Fernanda Costa', time: '14:00', procedure: 'Avaliação Podológica', status: 'confirmado' },
  { id: '6', patient: 'João Marcos da Silva', time: '15:30', procedure: 'Órtese Plantar', status: 'agendado' },
];

const mockFlowData: FlowDataPoint[] = [
  { day: 'Seg', pacientes: 8 },
  { day: 'Ter', pacientes: 12 },
  { day: 'Qua', pacientes: 6 },
  { day: 'Qui', pacientes: 15 },
  { day: 'Sex', pacientes: 11 },
  { day: 'Sáb', pacientes: 5 },
  { day: 'Dom', pacientes: 0 },
];

// -------------------------------------------------------------------

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Visão geral do seu consultório — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Chart + Appointments — two columns on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5">
        <div className="lg:col-span-3">
          <PatientFlowChart data={mockFlowData} />
        </div>
        <div className="lg:col-span-2">
          <UpcomingAppointments appointments={mockAppointments} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
