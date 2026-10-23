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

/** Manicure e podóloga veem apenas a própria agenda. */
export function isProfessionalRole(role: UserRole | null | undefined): boolean {
  return role === 'manicure' || role === 'podologa';
}

/** Página inicial de cada perfil após o login. */
export function homePathFor(role: UserRole | null | undefined): string {
  return role === 'admin' ? '/dashboard' : '/agendamentos';
}
