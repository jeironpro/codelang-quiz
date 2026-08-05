import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuiz } from './useQuiz';
import { useLocalStorage } from './useLocalStorage';
import { TIEMPO_PREGUNTA } from '../utils/constants';

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
    afterEach(() => {
        vi.useRealTimers();
    });

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

    it('arranca el temporizador en el máximo y lo reinicia al cambiar de pregunta', () => {
        // Solo se falsean los timers del temporizador, no microtasks ni Date,
        // para no romper el scheduler de React.
        vi.useFakeTimers({
            toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'],
        });
        const { result } = renderHook(() => useQuiz(preguntas));

        // Recien montado muestra el tiempo completo.
        expect(result.current.tiempoRestante).toBe(TIEMPO_PREGUNTA);
        expect(result.current.tiempoAgotado).toBe(false);

        // Un segundo despues baja a TIEMPO_PREGUNTA - 1.
        act(() => vi.advanceTimersByTime(1000));
        expect(result.current.tiempoRestante).toBe(TIEMPO_PREGUNTA - 1);

        // Al responder se detiene la cuenta y queda congelado.
        act(() => result.current.responder('A'));
        const congelado = result.current.tiempoRestante;
        act(() => vi.advanceTimersByTime(3000));
        expect(result.current.tiempoRestante).toBe(congelado);

        // Al continuar se reinicia para la siguiente pregunta.
        act(() => result.current.continuar());
        expect(result.current.tiempoRestante).toBe(TIEMPO_PREGUNTA);
    });

    it('al agotarse el tiempo bloquea la pregunta y registra un fallo', () => {
        vi.useFakeTimers({
            toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'],
        });
        const { result } = renderHook(() => useQuiz(preguntas));

        act(() => vi.advanceTimersByTime(TIEMPO_PREGUNTA * 1000));

        // La pregunta queda bloqueada, marcada como agotada y sin letra elegida.
        expect(result.current.bloqueada).toBe(true);
        expect(result.current.tiempoAgotado).toBe(true);
        expect(result.current.tiempoRestante).toBe(0);
        expect(result.current.seleccionada).toBe(null);

        // Cuenta como fallo: un fallo, cero aciertos y resta puntos.
        expect(result.current.aciertos).toBe(0);
        expect(result.current.fallos).toBe(1);
        expect(result.current.score).toBe(-1);
        expect(result.current.respuestas[0]).toMatchObject({ letra: null, esCorrecta: false });
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
