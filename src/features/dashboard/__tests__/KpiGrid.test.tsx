import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KpiGrid, { kpiTiles } from '../components/KpiGrid';
import { kpis } from './fixtures';

const value = (label: string) => kpiTiles(kpis).find((t) => t.label === label)?.value;

describe('KpiGrid', () => {
  it('formata dinheiro, porcentagem, minutos e null como "—"', () => {
    expect(value('Faturamento')).toMatch(/R\$\s?1\.234,50/);
    expect(value('Agendado pelo link')).toBe('33,3%');
    expect(value('Ocupação da agenda')).toBe('22,2%');
    expect(value('Atraso médio')).toBe('8,3 min');
    expect(value('Cancelamentos')).toBe('—');
    expect(value('Retorno realizado')).toBe('—');
    expect(value('Comissões a pagar')).toMatch(/R\$\s?72,00/);
  });

  it('sem comissões e ocupação omitida', () => {
    const tiles = kpiTiles({ ...kpis, commissions: undefined, occupancy: null });
    expect(tiles.find((t) => t.label === 'Comissões a pagar')).toBeUndefined();
    expect(tiles.find((t) => t.label === 'Ocupação da agenda')?.value).toBe('—');
  });

  it('renderiza os cartões', () => {
    render(<KpiGrid kpis={kpis} />);
    expect(screen.getByText('Ticket médio')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });
});
