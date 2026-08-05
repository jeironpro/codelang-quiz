import { describe, it, expect } from 'vitest';
import { validarPregunta, validarDataset } from './validators';
import { puntosDe, aplicarRespuesta } from './scoring';

// Tests de los modulos de validacion de datos y de puntuacion.
// Cubren los casos validos y los errores mas comunes de cada esquema.

describe('validarPregunta', () => {
  it('aprueba una pregunta válida', () => {
    // Una pregunta con todos los campos correctos no debe dar errores.
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
    // Una dificultad fuera del mapa debe generar un error de esquema.
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
    // Si la opcion de la respuesta esta vacia, la pregunta es invalida.
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
    // Repetir la misma pregunta dos veces debe detectar el id repetido.
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
    // Los puntos siguen la regla facil=1, media=2, dificil=3; lo desconocido vale 0.
    expect(puntosDe('facil')).toBe(1);
    expect(puntosDe('media')).toBe(2);
    expect(puntosDe('dificil')).toBe(3);
    expect(puntosDe('otro')).toBe(0);
  });

  it('suma al acertar y resta al fallar', () => {
    // Acertar suma el delta; fallar lo resta.
    expect(aplicarRespuesta(0, 'media', true)).toBe(2);
    expect(aplicarRespuesta(0, 'media', false)).toBe(-2);
  });
});
