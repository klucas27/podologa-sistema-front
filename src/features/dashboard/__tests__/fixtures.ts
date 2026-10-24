import type { Kpis } from '../services/kpi.service';

export const kpis: Kpis = {
  period: { from: '2026-10-01', to: '2026-10-24' },
  professionalId: null,
  revenue: { total: 1234.5, byProfessional: [{ professionalId: 'p1', name: 'Ana', total: 1234.5 }], byService: [{ serviceId: 's1', name: 'Manicure', total: 1234.5 }] },
  averageTicket: 52.5,
  clients: { active90d: 18, newInPeriod: 4 },
  linkShare: 0.3333,
  confirmationMinutes: 60,
  noShowRate: 0.0833,
  cancellationRate: null,
  acquisition: [{ source: 'instagram', count: 3 }],
  occupancy: { overall: 0.2222, byProfessional: [] },
  punctuality: { averageDelayMinutes: 8.33, lateShare: 0.3333 },
  referralConversion: 0.5,
  returnRate: null,
  warnings: [],
  commissions: { total: 72, byProfessional: [{ professionalId: 'p1', name: 'Ana', total: 72 }] },
  stock: { expiring: 2, belowMin: 1, shortages: 0 },
};
