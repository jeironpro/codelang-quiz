import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QuizProvider } from '../context/QuizContext';
import Quiz from './Quiz';
import { TIEMPO_PREGUNTA } from '../utils/constants';

// Dataset de prueba con dos preguntas para recorrer el flujo del quiz.
const preguntas = [
    {
        id: '1',
        dificultad: 'facil',
        tipo: 'concepto',
        pregunta: '¿Qué es una constante?',
        opciones: { A: 'Un valor fijo', B: 'Un string', C: 'Un dato', D: 'Una función' },
        respuesta: 'A',
        explicacion: 'Un valor que no cambia.',
    },
    {
        id: '2',
        dificultad: 'media',
        tipo: 'concepto',
        pregunta: 'Segunda pregunta',
        opciones: { A: 'a', B: 'b', C: 'c', D: 'd' },
        respuesta: 'B',
        explicacion: 'Segunda razón.',
    },
];

// Renderiza el quiz en el estado de ruta que le entrega las preguntas.
function renderizarQuiz() {
    return render(
        <MemoryRouter initialEntries={[{ pathname: '/quiz', state: { preguntas } }]}>
            <QuizProvider>
                <Quiz />
            </QuizProvider>
        </MemoryRouter>,
    );
}

describe('Quiz - feedback', () => {
    it('muestra feedback de error con la respuesta correcta al fallar', async () => {
        renderizarQuiz();
        const user = userEvent.setup();

        // Se elige una opcion incorrecta (C en lugar de la A correcta).
        await user.click(screen.getByRole('button', { name: /Un dato/i }));

        expect(screen.getByText(/No acertaste/i)).toBeInTheDocument();
        expect(screen.getByText(/La correcta era la opción A/i)).toBeInTheDocument();
    });

    it('no muestra la explicación hasta responder', () => {
        // Antes de responder no debe aparecer ningun feedback.
        renderizarQuiz();
        expect(screen.queryByText(/Acertaste/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/No acertaste/i)).not.toBeInTheDocument();
    });

    it('al acertar muestra feedback y avanza al pulsar siguiente', async () => {
        renderizarQuiz();
        const user = userEvent.setup();

        // Se elige la opcion correcta (A).
        await user.click(screen.getByRole('button', { name: /Un valor fijo/i }));

        // Muestra confirmación de acierto con los puntos ganados.
        expect(screen.getByText(/Acertaste. \+1 punto/i)).toBeInTheDocument();
        expect(screen.queryByText(/No acertaste/i)).not.toBeInTheDocument();

        // Siguiente lleva a la segunda pregunta del dataset.
        await user.click(screen.getByRole('button', { name: 'Siguiente' }));
        expect(screen.getByText('Segunda pregunta')).toBeInTheDocument();
    });
});

describe('Quiz - temporizador', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('muestra el temporizador con el tiempo completo de la pregunta', () => {
        renderizarQuiz();
        expect(screen.getByRole('timer')).toHaveTextContent(`${TIEMPO_PREGUNTA}s`);
    });

    it('al agotarse el tiempo muestra el feedback de tiempo agotado', async () => {
        // Solo se falsean los timers del temporizador, no microtasks ni Date,
        // para no romper el scheduler de React.
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderizarQuiz();

        // Se avanza el reloj hasta agotar los segundos de la pregunta.
        act(() => {
            vi.advanceTimersByTime(TIEMPO_PREGUNTA * 1000);
        });

        // El feedback indica que el tiempo se acabo y revela la opcion correcta.
        expect(screen.getByText(/Se acabó el tiempo/i)).toBeInTheDocument();
        expect(screen.getByText(/La correcta era la opción A/i)).toBeInTheDocument();

        // Sigue permitiendo continuar a la siguiente pregunta.
        await user.click(screen.getByRole('button', { name: 'Siguiente' }));
        expect(screen.getByText('Segunda pregunta')).toBeInTheDocument();
    });
});

describe('Quiz - detener partida', () => {
    // Arranca cada test sin datos previos en el almacenamiento local.
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('mantiene deshabilitado el boton de detener sin preguntas respondidas', () => {
        renderizarQuiz();
        expect(screen.getByRole('button', { name: 'Detener partida' })).toBeDisabled();
    });

    it('continuar jugando cierra el modal sin guardar la partida', async () => {
        const user = userEvent.setup();
        renderizarQuiz();

        // Se responde para habilitar la detencion y abrir la confirmacion.
        await user.click(screen.getByRole('button', { name: /Un valor fijo/i }));
        await user.click(screen.getByRole('button', { name: 'Detener partida' }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();

        // Cancelar cierra el modal y no escribe nada en el historial.
        await user.click(screen.getByRole('button', { name: 'Continuar jugando' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(window.localStorage.getItem('codelang-quiz:historial')).toBeNull();
    });

    it('detener y guardar conserva la puntuacion parcial', async () => {
        const user = userEvent.setup();
        renderizarQuiz();

        // Un acierto en la primera pregunta: +1 punto.
        await user.click(screen.getByRole('button', { name: /Un valor fijo/i }));
        await user.click(screen.getByRole('button', { name: 'Detener partida' }));
        await user.click(screen.getByRole('button', { name: 'Detener y guardar' }));

        // La partida parcial queda registrada con las preguntas respondidas.
        const historial = JSON.parse(window.localStorage.getItem('codelang-quiz:historial'));
        expect(historial[0]).toMatchObject({ aciertos: 1, fallos: 0, puntos: 1, total: 1 });

        // El score acumulado conserva los puntos ganados hasta el momento.
        expect(JSON.parse(window.localStorage.getItem('codelang-quiz:score'))).toBe(1);
    });
});
