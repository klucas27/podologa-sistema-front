import { describe, it, expect } from 'vitest';
import { NAV_ROLES, canAccess } from '../permissions';
import type { UserRole } from '@/types';

const visible = (role: UserRole) => Object.keys(NAV_ROLES).filter((p) => canAccess(role, p));

describe('menu por perfil', () => {
  it('admin vê tudo', () => {
    expect(visible('admin')).toEqual(Object.keys(NAV_ROLES));
  });

  it('recepção: sem dashboard, profissionais, usuários e patologias', () => {
    expect(visible('recepcao')).toEqual(['/pacientes', '/consultas', '/agendamentos', '/pedidos', '/servicos', '/estoque', '/transacoes', '/configuracoes']);
  });

  it('manicure: clientes, atendimentos, agenda, estoque e configurações', () => {
    expect(visible('manicure')).toEqual(['/pacientes', '/consultas', '/agendamentos', '/estoque', '/configuracoes']);
  });

  it('podóloga também vê patologias', () => {
    expect(visible('podologa')).toEqual(['/pacientes', '/consultas', '/agendamentos', '/estoque', '/patologias', '/configuracoes']);
  });

  it('sem perfil não vê nada', () => {
    expect(canAccess(null, '/agendamentos')).toBe(false);
  });
});
