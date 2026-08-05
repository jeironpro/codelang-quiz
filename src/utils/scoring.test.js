import { describe, it, expect } from 'vitest';
import { validarPregunta, validarDataset } from './validators';
import { puntosDe, aplicarRespuesta } from './scoring';

describe('validarPregunta', () => {
  it('aprueba una pregunta válida', () => {
    const pregunta = {
      id: 'x-1',
      dificultad: 'facil',
      tipo: 'concepto',
      pregunta: '¿Qué es X?',
      opciones: { A: 'Uno', B: 'Dos', C: 'Tres', D: 'Cuatro' },
      respuesta: 'A',
      explicacion: 'Razón.',
    };
    expect(validarPregunta(pregunta, '0')).toEqual([]);
  });

  it('detecta dificultad inexistente', () => {
    const pregunta = {
      id: 'x-2',
      dificultad: 'imposible',
      tipo: 'concepto',
      pregunta: '¿?',
      opciones: { A: 'a', B: 'b', C: 'c', D: 'd' },
      respuesta: 'A',
      explicacion: 'e',
    };
    const errores = validarPregunta(pregunta);
    expect(errores.some((e) => e.includes('dificultad'))).toBe(true);
  });

  it('detecta respuesta que no existe en opciones', () => {
    const pregunta = {
      id: 'x-3',
      dificultad: 'facil',
      tipo: 'concepto',
      pregunta: '¿?',
      opciones: { A: 'a', B: 'b', C: 'c', D: 'd' },
      respuesta: 'C',
      explicacion: 'e',
    };
    pregunta.opciones.C = '';
    const errores = validarPregunta(pregunta);
    expect(errores.some((e) => e.includes('opciones.C'))).toBe(true);
  });
});

describe('validarDataset', () => {
  it('reporta ids duplicados', () => {
    const base = {
      id: 'dup',
      dificultad: 'facil',
      tipo: 'concepto',
      pregunta: '¿?',
      opciones: { A: 'a', B: 'b', C: 'c', D: 'd' },
      respuesta: 'A',
      explicacion: 'e',
    };
    const errores = validarDataset({ lenguaje: [base, base] });
    expect(errores.some((e) => e.includes('id duplicado'))).toBe(true);
  });
});

describe('scoring', () => {
  it('calcula puntos por dificultad', () => {
    expect(puntosDe('facil')).toBe(1);
    expect(puntosDe('media')).toBe(2);
    expect(puntosDe('dificil')).toBe(3);
    expect(puntosDe('otro')).toBe(0);
  });

  it('suma al acertar y resta al fallar', () => {
    expect(aplicarRespuesta(0, 'media', true)).toBe(2);
    expect(aplicarRespuesta(0, 'media', false)).toBe(-2);
  });
});
