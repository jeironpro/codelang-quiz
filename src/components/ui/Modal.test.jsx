import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QuizProvider } from '../../context/QuizContext';
import Navbar from '../layout/Navbar';

// Renderiza la barra de navegacion con su provider y router.
function renderizarNavbar() {
  return render(
    <MemoryRouter>
      <QuizProvider>
        <Navbar />
      </QuizProvider>
    </MemoryRouter>,
  );
}

describe('Modal informativo de localStorage', () => {
  it('se abre desde el boton de la navbar y explica que se guarda', async () => {
    const user = userEvent.setup();
    renderizarNavbar();

    // El modal no debe estar visible antes de abrirlo.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /información sobre los datos/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/localStorage/i)).toBeInTheDocument();
    expect(screen.getByText(/no se envían a ningún servidor/i)).toBeInTheDocument();
  });

  it('se cierra con el boton Entendido', async () => {
    const user = userEvent.setup();
    renderizarNavbar();

    await user.click(screen.getByRole('button', { name: /información sobre los datos/i }));
    await user.click(screen.getByRole('button', { name: 'Entendido' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se cierra al pulsar la tecla Escape', async () => {
    const user = userEvent.setup();
    renderizarNavbar();

    await user.click(screen.getByRole('button', { name: /información sobre los datos/i }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se cierra al pulsar el fondo oscuro', async () => {
    const user = userEvent.setup();
    renderizarNavbar();

    await user.click(screen.getByRole('button', { name: /información sobre los datos/i }));
    // El fondo oscuro es el contenedor del dialogo.
    await user.click(screen.getByRole('dialog').parentElement);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
