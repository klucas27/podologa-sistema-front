import { describe, it, expect } from 'vitest';
import { NAV_ROLES, canAccess } from '../permissions';
import type { UserRole } from '@/types';

const visible = (role: UserRole) => Object.keys(NAV_ROLES).filter((p) => canAccess(role, p));

describe('menu por perfil', () => {
  it('admin vê tudo', () => {
    expect(visible('admin')).toEqual(Object.keys(NAV_ROLES));
  });

  it('recepção: sem profissionais, usuários e patologias', () => {
    expect(visible('recepcao')).toEqual(['/dashboard', '/pacientes', '/consultas', '/agendamentos', '/pedidos', '/servicos', '/encaminhamentos', '/estoque', '/transacoes', '/configuracoes']);
  });

  it('manicure: clientes, atendimentos, agenda, encaminhamentos, estoque e configurações', () => {
    expect(visible('manicure')).toEqual(['/dashboard', '/pacientes', '/consultas', '/agendamentos', '/encaminhamentos', '/estoque', '/configuracoes']);
  });

  it('podóloga também vê patologias', () => {
    expect(visible('podologa')).toEqual(['/dashboard', '/pacientes', '/consultas', '/agendamentos', '/encaminhamentos', '/estoque', '/patologias', '/configuracoes']);
  });

  it('sem perfil não vê nada', () => {
    expect(canAccess(null, '/agendamentos')).toBe(false);
  });
});
