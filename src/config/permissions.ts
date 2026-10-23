import type { UserRole } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administradora',
  recepcao: 'Recepção',
  manicure: 'Manicure',
  podologa: 'Podóloga',
};

const ROLES: readonly UserRole[] = ['admin', 'recepcao', 'manicure', 'podologa'];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

/** Dados de saúde (anamnese, evolução, patologias): só podóloga e admin. */
export const HEALTH_ROLES: readonly UserRole[] = ['admin', 'podologa'];

export function canSeeHealth(role: UserRole | null | undefined): boolean {
  return !!role && HEALTH_ROLES.includes(role);
}

/** Manicure e podóloga veem apenas a própria agenda. */
export function isProfessionalRole(role: UserRole | null | undefined): boolean {
  return role === 'manicure' || role === 'podologa';
}

/** Página inicial de cada perfil após o login. */
export function homePathFor(role: UserRole | null | undefined): string {
  return role === 'admin' ? '/dashboard' : '/agendamentos';
}

const ALL: readonly UserRole[] = ROLES;

/** Quem vê cada item do menu (espelha a matriz de perfis do back). */
export const NAV_ROLES: Record<string, readonly UserRole[]> = {
  '/dashboard': ['admin'],
  '/pacientes': ALL,
  '/consultas': ALL,
  '/agendamentos': ALL,
  '/pedidos': ['admin', 'recepcao'],
  '/profissionais': ['admin'],
  '/servicos': ['admin', 'recepcao'],
  '/usuarios': ['admin'],
  '/transacoes': ['admin', 'recepcao'],
  '/patologias': ['admin', 'podologa'],
  '/configuracoes': ALL,
};

export function canAccess(role: UserRole | null | undefined, path: string): boolean {
  return !!role && (NAV_ROLES[path] ?? []).includes(role);
}
