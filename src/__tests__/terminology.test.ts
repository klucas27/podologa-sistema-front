import { describe, it, expect } from 'vitest';

/**
 * Salão de estética + podologia: as telas falam "Cliente" e "Atendimento".
 * "Paciente"/"Consulta" só na parte clínica da podologia (anamnese, evolução, patologias).
 */
const files = import.meta.glob(['../features/**/*.tsx', '../components/**/*.tsx', '!**/__tests__/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const EXCEPTIONS = [
  '/features/anamneses/',
  '/features/pathologies/',
  'ClinicalEvolutionSection.tsx',
  'PathologySection.tsx',
];

const OLD_TERMS = /\b(Paciente|Pacientes|Consulta|Consultas)\b/;

describe('terminologia das telas', () => {
  it('lê os componentes', () => {
    expect(Object.keys(files).length).toBeGreaterThan(50);
  });

  it('não usa "Paciente"/"Consulta" fora da parte clínica', () => {
    const offenders = Object.entries(files)
      .filter(([path]) => !EXCEPTIONS.some((e) => path.includes(e)))
      .flatMap(([path, source]) =>
        source.split('\n').flatMap((line, i) => (OLD_TERMS.test(line) ? [`${path}:${i + 1}: ${line.trim()}`] : [])),
      );
    expect(offenders).toEqual([]);
  });
});
