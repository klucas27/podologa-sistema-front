export interface DashboardMetrics {
  appointments: number;
  appointmentsPrevious: number;
  newPatients: number;
  newPatientsPrevious: number;
  revenue: number;
  revenuePrevious: number;
  returnAlerts: { total: number; urgent: number };
}

export interface DashboardAppointment {
  id: string;
  patient: string;
  time: string;
  procedure: string | null;
  status: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface WaterfallDataPoint {
  label: string;
  value: number;
  type: 'positive' | 'negative' | 'total';
}

export interface HeatmapDataPoint {
  x: string;
  y: string;
  value: number;
}

export interface ReturnAlertItem {
  id: string;
  patient: string;
  dueDate: string;
  daysOverdue: number;
  urgent: boolean;
}

export type KpiType = "appointments" | "patients" | "revenue" | "alerts";
export type PeriodType = "daily" | "weekly" | "monthly" | "annual";

export interface DashboardData {
  metrics: DashboardMetrics;
  todayAppointments: DashboardAppointment[];
  chartData: ChartDataPoint[];
  movingAverage: ChartDataPoint[];
  previousPeriodData: ChartDataPoint[];
  waterfallData: WaterfallDataPoint[];
  heatmapData: HeatmapDataPoint[];
  returnAlerts: ReturnAlertItem[];
}
