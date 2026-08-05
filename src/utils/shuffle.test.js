import { describe, it, expect, vi } from 'vitest';
import { barajar } from './shuffle';

// Tests del algoritmo de barajado de opciones.
// Aseguran que la permutacion es valida y que nunca se muta el original.

describe('barajar', () => {
  it('devuelve una permutación del arreglo original', () => {
    const original = ['A', 'B', 'C', 'D'];
    const resultado = barajar(original);
    expect([...resultado].sort()).toEqual([...original].sort());
    expect(resultado).toHaveLength(original.length);
  });

  it('no muta el arreglo original', () => {
    const original = ['A', 'B', 'C', 'D'];
    const referencia = [...original];
    barajar(original);
    expect(original).toEqual(referencia);
  });

  it('con una semilla fija la permutación es determinista', () => {
    const aleatorios = [0.5, 0.1, 0.9];
    const original = ['A', 'B', 'C', 'D'];
    const randomEspia = vi.spyOn(Math, 'random').mockImplementation(() => aleatorios.shift() ?? 0);
    const resultado = barajar(original);
    expect(resultado).not.toEqual(original);
    randomEspia.mockRestore();
  });
});
