import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QuizProvider } from '../context/QuizContext';
import Quiz from './Quiz';

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

    await user.click(screen.getByRole('button', { name: /Un dato/i }));

    expect(screen.getByText(/No acertaste/i)).toBeInTheDocument();
    expect(screen.getByText(/La correcta era la opción A/i)).toBeInTheDocument();
  });

  it('no muestra la explicación hasta responder', () => {
    renderizarQuiz();
    expect(screen.queryByText(/Acertaste/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No acertaste/i)).not.toBeInTheDocument();
  });

  it('al acertar muestra feedback y avanza al pulsar siguiente', async () => {
    renderizarQuiz();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Un valor fijo/i }));

    // Muestra confirmación de acierto con los puntos ganados.
    expect(screen.getByText(/Acertaste. \+1 punto/i)).toBeInTheDocument();
    expect(screen.queryByText(/No acertaste/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText('Segunda pregunta')).toBeInTheDocument();
  });
});
