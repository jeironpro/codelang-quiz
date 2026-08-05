import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuiz } from './useQuiz';
import { useLocalStorage } from './useLocalStorage';

// Dataset de prueba con dos preguntas de distinta dificultad.
const preguntas = [
  {
    id: '1',
    dificultad: 'facil',
    tipo: 'concepto',
    pregunta: 'Q1',
    opciones: { A: 'a', B: 'b', C: 'c', D: 'd' },
    respuesta: 'A',
    explicacion: 'x',
  },
  {
    id: '2',
    dificultad: 'dificil',
    tipo: 'concepto',
    pregunta: 'Q2',
    opciones: { A: 'a', B: 'b', C: 'c', D: 'd' },
    respuesta: 'C',
    explicacion: 'y',
  },
];

describe('useQuiz', () => {
  it('calcula score sumando en aciertos y restando en fallos', () => {
    const { result } = renderHook(() => useQuiz(preguntas));

    act(() => result.current.responder('A')); // acierto facil +1
    act(() => result.current.continuar());
    act(() => result.current.responder('A')); // fallo dificil -3

    expect(result.current.score).toBe(-2);
  });

  it('llama onTerminar en la última pregunta', () => {
    let terminado = false;
    const { result } = renderHook(() => useQuiz(preguntas, () => (terminado = true)));

    // Se responde y continua hasta agotar el dataset.
    act(() => result.current.responder('A'));
    act(() => result.current.continuar());
    act(() => result.current.responder('C'));
    act(() => result.current.continuar());

    expect(terminado).toBe(true);
  });

  it('no avanza al acertar: queda bloqueada hasta continuar', () => {
    const { result } = renderHook(() => useQuiz(preguntas));

    act(() => result.current.responder('A'));

    // Sigue en la primera pregunta y bloqueada mostrando el feedback.
    expect(result.current.indice).toBe(0);
    expect(result.current.bloqueada).toBe(true);
    expect(result.current.seleccionada).toBe('A');

    // Al continuar avanza y se desbloquea la siguiente.
    act(() => result.current.continuar());
    expect(result.current.indice).toBe(1);
    expect(result.current.bloqueada).toBe(false);
    expect(result.current.seleccionada).toBe(null);
  });
});

describe('useLocalStorage', () => {
  it('persiste el valor en localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('clave-test', 0));
    act(() => result.current[1](5));
    // El valor guardado debe poder leerse de vuelta como JSON.
    expect(JSON.parse(window.localStorage.getItem('clave-test'))).toBe(5);
  });
});
