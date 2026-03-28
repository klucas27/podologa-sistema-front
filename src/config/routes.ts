export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  ACCESS_DENIED: "/acesso-negado",
  DASHBOARD: "/dashboard",
  PATIENTS: "/pacientes",
  PATIENT_NEW: "/pacientes/novo",
  PATIENT_DETAIL: (id: string) => `/pacientes/${id}`,
  PATIENT_EDIT: (id: string) => `/pacientes/${id}/editar`,
  PATIENT_ANAMNESIS_NEW: (patientId: string) =>
    `/pacientes/${patientId}/anamnese/nova`,
  APPOINTMENTS: "/agendamentos",
  CONSULTATIONS: "/consultas",
  CONSULTATION_NEW: "/consultas/nova",
  CONSULTATION_EXECUTION: (appointmentId: string) =>
    `/consultas/${appointmentId}/execucao`,
  PROFESSIONALS: "/profissionais",
  BILLING: "/transacoes",
  PATHOLOGIES: "/patologias",
  SETTINGS: "/configuracoes",
} as const;
